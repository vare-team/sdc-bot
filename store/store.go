package store

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	_ "github.com/go-sql-driver/mysql"

	"sdc/domain"
)

type Store struct {
	db *sql.DB
}

func Open(dsn string) (*Store, error) {
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, fmt.Errorf("open mysql: %w", err)
	}
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(10)
	db.SetConnMaxLifetime(5 * time.Minute)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := db.PingContext(ctx); err != nil {
		_ = db.Close()
		return nil, fmt.Errorf("ping mysql: %w", err)
	}
	return &Store{db: db}, nil
}

func (s *Store) Close() error {
	if s == nil || s.db == nil {
		return nil
	}
	return s.db.Close()
}

func (s *Store) DB() *sql.DB {
	return s.db
}

func (s *Store) GuildExists(ctx context.Context, id string) (bool, error) {
	var found string
	err := s.db.QueryRowContext(ctx, `SELECT id FROM guilds WHERE id = ?`, id).Scan(&found)
	if err == sql.ErrNoRows {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	return true, nil
}

func (s *Store) GuildByID(ctx context.Context, id string) (*domain.Guild, error) {
	var (
		g          domain.Guild
		upAt       sql.NullTime
		boostEndAt sql.NullTime
		name       sql.NullString
		icon       sql.NullString
		userID     sql.NullString
		isBot      sql.NullBool
		members    sql.NullInt64
	)
	err := s.db.QueryRowContext(ctx,
		`SELECT id, name, COALESCE(icon,''), up_at, status, boost, boost_end_at, up_count, members, user_id, is_bot
		 FROM guilds WHERE id = ?`, id,
	).Scan(&g.ID, &name, &icon, &upAt, &g.Status, &g.Boost, &boostEndAt, &g.UpCount, &members, &userID, &isBot)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	g.Name = name.String
	g.Icon = icon.String
	g.UserID = userID.String
	g.IsBot = isBot.Bool
	if members.Valid {
		g.Members = int(members.Int64)
	}
	if upAt.Valid {
		g.UpAt = upAt.Time
	}
	if boostEndAt.Valid {
		t := boostEndAt.Time
		g.BoostEndAt = &t
	}
	return &g, nil
}

func (s *Store) GuildSocials(ctx context.Context, id string) (map[string]string, error) {
	var raw []byte
	err := s.db.QueryRowContext(ctx, `SELECT socials FROM guilds WHERE id = ?`, id).Scan(&raw)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return domain.ParseSocials(raw), nil
}

// userUpsertSet keeps existing profile fields when the incoming values are empty
// (e.g. GuildCreate only knows owner id, not username).
const userUpsertSet = `username = IF(VALUES(username) = '', username, VALUES(username)),
		 avatar = IF(VALUES(avatar) IS NULL, avatar, VALUES(avatar)),
		 updated_at = VALUES(updated_at)`

func (s *Store) UpsertUser(ctx context.Context, u domain.User) error {
	_, err := s.db.ExecContext(ctx,
		`INSERT INTO users (id, username, avatar, created_at, updated_at)
		 VALUES (?, ?, ?, NOW(), NOW())
		 ON DUPLICATE KEY UPDATE `+userUpsertSet,
		u.ID, u.Username, nullAvatar(u.Avatar),
	)
	return err
}

func (s *Store) ActivateBot(ctx context.Context, id string, members int, owner domain.User) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback() }()

	if _, err := tx.ExecContext(ctx,
		`INSERT INTO users (id, username, avatar, created_at, updated_at)
		 VALUES (?, ?, ?, NOW(), NOW())
		 ON DUPLICATE KEY UPDATE `+userUpsertSet,
		owner.ID, owner.Username, nullAvatar(owner.Avatar),
	); err != nil {
		return err
	}
	if _, err := tx.ExecContext(ctx,
		`UPDATE guilds SET is_bot = 1, members = ?, user_id = ? WHERE id = ?`,
		members, owner.ID, id,
	); err != nil {
		return err
	}
	return tx.Commit()
}

func (s *Store) DeactivateBot(ctx context.Context, id string) error {
	_, err := s.db.ExecContext(ctx, `UPDATE guilds SET is_bot = 0 WHERE id = ?`, id)
	return err
}

func (s *Store) SoftDeleteGuild(ctx context.Context, id string) error {
	_, err := s.db.ExecContext(ctx, `UPDATE guilds SET deleted_at = NOW() WHERE id = ?`, id)
	return err
}

func (s *Store) SyncGuildProfile(ctx context.Context, id, name, icon string, members int, owner domain.User) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback() }()

	if _, err := tx.ExecContext(ctx,
		`INSERT INTO users (id, username, avatar, created_at, updated_at)
		 VALUES (?, ?, ?, NOW(), NOW())
		 ON DUPLICATE KEY UPDATE `+userUpsertSet,
		owner.ID, owner.Username, nullAvatar(owner.Avatar),
	); err != nil {
		return err
	}
	if _, err := tx.ExecContext(ctx,
		`UPDATE guilds SET name = ?, icon = ?, members = ?, user_id = ? WHERE id = ?`,
		name, icon, members, owner.ID, id,
	); err != nil {
		return err
	}
	return tx.Commit()
}

type BumpParams struct {
	GuildID      string
	UpAt         time.Time
	Members      int
	OwnerID      string
	Actor        domain.User
	Owner        domain.User
	Delta        int64
	CooldownAsOf time.Time // eligibility clock; must match OnCooldown(now)
}

// Bump updates guild up_at/up_count only if cooldown has elapsed.
// applied=false means another bump (bot or site) won the race.
func (s *Store) Bump(ctx context.Context, p BumpParams) (applied bool, err error) {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return false, err
	}
	defer func() { _ = tx.Rollback() }()

	if _, err := tx.ExecContext(ctx,
		`INSERT INTO users (id, username, avatar, created_at, updated_at)
		 VALUES (?, ?, ?, NOW(), NOW()), (?, ?, ?, NOW(), NOW())
		 ON DUPLICATE KEY UPDATE `+userUpsertSet,
		p.Actor.ID, p.Actor.Username, nullAvatar(p.Actor.Avatar),
		p.Owner.ID, p.Owner.Username, nullAvatar(p.Owner.Avatar),
	); err != nil {
		return false, err
	}

	// Atomic cooldown: OnCooldown ⇔ now.Sub(up_at) <= 4h ⇔ up_at >= now-4h.
	// Allow bump only when up_at < now-4h (up_at is NOT NULL in schema).
	cooldownFloor := p.CooldownAsOf.Add(-domain.UpCooldown)
	res, err := tx.ExecContext(ctx,
		`UPDATE guilds SET up_at = ?, up_count = up_count + ?, members = ?, user_id = ?
		 WHERE id = ? AND up_at < ?`,
		p.UpAt, p.Delta, p.Members, p.OwnerID, p.GuildID, cooldownFloor,
	)
	if err != nil {
		return false, err
	}
	n, err := res.RowsAffected()
	if err != nil {
		return false, err
	}
	if n == 0 {
		return false, nil
	}
	if err := tx.Commit(); err != nil {
		return false, err
	}
	return true, nil
}

func (s *Store) TryLockBump(ctx context.Context, guildID string) (unlock func() error, ok bool, err error) {
	conn, err := s.db.Conn(ctx)
	if err != nil {
		return nil, false, err
	}

	name := lockName(guildID)
	var got sql.NullInt64
	if err := conn.QueryRowContext(ctx, `SELECT GET_LOCK(?, 0)`, name).Scan(&got); err != nil {
		_ = conn.Close()
		return nil, false, err
	}
	if !got.Valid || got.Int64 != 1 {
		_ = conn.Close()
		return nil, false, nil
	}

	unlock = func() error {
		defer func() { _ = conn.Close() }()
		_, err := conn.ExecContext(context.Background(), `SELECT RELEASE_LOCK(?)`, name)
		return err
	}
	return unlock, true, nil
}

// placeAheadSQL: how many guilds rank strictly above g.
// Order: up_count DESC, up_at ASC, id ASC.
// Only active guilds with the bot online: deleted_at IS NULL AND is_bot = 1.
const placeAheadSQL = `
	SELECT COUNT(*) + 1 FROM guilds o
	WHERE o.deleted_at IS NULL
	  AND o.is_bot = 1
	  AND (
		o.up_count > g.up_count
		OR (
			o.up_count = g.up_count
			AND (
				o.up_at < g.up_at
				OR (o.up_at = g.up_at AND o.id < g.id)
			)
		)
	  )`

func (s *Store) GuildPlace(ctx context.Context, id string) (place int64, upCount int64, err error) {
	err = s.db.QueryRowContext(ctx, `
		SELECT (`+placeAheadSQL+`) AS place, g.up_count
		FROM guilds g
		WHERE g.id = ? AND g.deleted_at IS NULL AND g.is_bot = 1`, id).Scan(&place, &upCount)
	if err != nil {
		return 0, 0, err
	}
	return place, upCount, nil
}

func (s *Store) GuildInfo(ctx context.Context, id string) (*domain.GuildInfo, error) {
	var info domain.GuildInfo
	var boostEnd sql.NullTime
	err := s.db.QueryRowContext(ctx, `
		SELECT g.up_count, g.boost, g.boost_end_at, g.status,
			(`+placeAheadSQL+`) AS place,
			COALESCE(SUM(c.rate), 0) AS rating,
			COUNT(c.text) AS comments
		FROM guilds g
		LEFT JOIN comments c ON c.guild_id = g.id
		WHERE g.id = ? AND g.deleted_at IS NULL AND g.is_bot = 1
		GROUP BY g.id, g.up_count, g.boost, g.boost_end_at, g.status, g.up_at`, id,
	).Scan(&info.UpCount, &info.Boost, &boostEnd, &info.Status, &info.Place, &info.Rating, &info.Comments)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	if boostEnd.Valid {
		t := boostEnd.Time
		info.BoostEndAt = &t
	}
	return &info, nil
}

const syncIDBatchSize = 500

func (s *Store) SyncIsBot(ctx context.Context, liveIDs []string) error {
	if len(liveIDs) == 0 {
		_, err := s.db.ExecContext(ctx, `UPDATE guilds SET is_bot = 0 WHERE is_bot = 1`)
		return err
	}

	live := make(map[string]struct{}, len(liveIDs))
	for _, id := range liveIDs {
		live[id] = struct{}{}
	}

	botIDs, err := s.botOnlineIDs(ctx)
	if err != nil {
		return err
	}

	toOff := make([]string, 0)
	for _, id := range botIDs {
		if _, ok := live[id]; !ok {
			toOff = append(toOff, id)
		}
	}

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback() }()

	if err := execIDBatches(ctx, tx, toOff, syncIDBatchSize,
		`UPDATE guilds SET is_bot = 0 WHERE is_bot = 1 AND id IN (%s)`); err != nil {
		return err
	}
	if err := execIDBatches(ctx, tx, liveIDs, syncIDBatchSize,
		`UPDATE guilds SET is_bot = 1 WHERE is_bot = 0 AND id IN (%s)`); err != nil {
		return err
	}
	return tx.Commit()
}

func (s *Store) MissingFromDB(ctx context.Context, liveIDs []string) ([]string, error) {
	if len(liveIDs) == 0 {
		return nil, nil
	}

	found := make(map[string]struct{}, len(liveIDs))
	for _, batch := range chunkStrings(liveIDs, syncIDBatchSize) {
		args := make([]interface{}, len(batch))
		ph := make([]string, len(batch))
		for i, id := range batch {
			args[i] = id
			ph[i] = "?"
		}
		q := fmt.Sprintf(`SELECT id FROM guilds WHERE id IN (%s)`, strings.Join(ph, ","))
		rows, err := s.db.QueryContext(ctx, q, args...)
		if err != nil {
			return nil, err
		}
		for rows.Next() {
			var id string
			if err := rows.Scan(&id); err != nil {
				_ = rows.Close()
				return nil, err
			}
			found[id] = struct{}{}
		}
		err = rows.Err()
		_ = rows.Close()
		if err != nil {
			return nil, err
		}
	}

	missing := make([]string, 0)
	for _, id := range liveIDs {
		if _, ok := found[id]; !ok {
			missing = append(missing, id)
		}
	}
	return missing, nil
}

func (s *Store) botOnlineIDs(ctx context.Context) ([]string, error) {
	rows, err := s.db.QueryContext(ctx, `SELECT id FROM guilds WHERE is_bot = 1`)
	if err != nil {
		return nil, err
	}
	defer func() { _ = rows.Close() }()

	ids := make([]string, 0, 1024)
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		ids = append(ids, id)
	}
	return ids, rows.Err()
}

type execer interface {
	ExecContext(ctx context.Context, query string, args ...interface{}) (sql.Result, error)
}

func execIDBatches(ctx context.Context, db execer, ids []string, batchSize int, queryFmt string) error {
	for _, batch := range chunkStrings(ids, batchSize) {
		args := make([]interface{}, len(batch))
		ph := make([]string, len(batch))
		for i, id := range batch {
			args[i] = id
			ph[i] = "?"
		}
		q := fmt.Sprintf(queryFmt, strings.Join(ph, ","))
		if _, err := db.ExecContext(ctx, q, args...); err != nil {
			return err
		}
	}
	return nil
}

func chunkStrings(ids []string, n int) [][]string {
	if len(ids) == 0 {
		return nil
	}
	if n <= 0 {
		n = syncIDBatchSize
	}
	out := make([][]string, 0, (len(ids)+n-1)/n)
	for i := 0; i < len(ids); i += n {
		end := i + n
		if end > len(ids) {
			end = len(ids)
		}
		out = append(out, ids[i:end])
	}
	return out
}

func lockName(guildID string) string {
	// MySQL GET_LOCK name max 64 chars
	name := "sdc_bump_" + guildID
	if len(name) > 64 {
		return name[:64]
	}
	return name
}

func nullAvatar(avatar string) interface{} {
	if avatar == "" {
		return nil
	}
	return avatar
}
