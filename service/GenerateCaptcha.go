package service

import (
	"bytes"
	"github.com/fogleman/gg"
	"github.com/golang/freetype/truetype"
	"golang.org/x/image/font/gofont/goregular"
	"sdc/models"
	"strings"
)

const imageWidth, imageHeight = 300, 80

func GenerateCaptcha(text string) *bytes.Buffer {
	font, _ := truetype.Parse(goregular.TTF)

	startPixel := RandomInt(20, 80)

	canvas := gg.NewContext(imageWidth, imageHeight)

	canvas.SetHexColor("37393F")
	canvas.DrawRectangle(0, 0, imageWidth, imageHeight)
	canvas.Fill()

	for _, letter := range strings.Split(text, "") {
		canvas.MoveTo(0, RandomInt(0, imageHeight))
		canvas.SetLineWidth(RandomInt(1, 6))
		canvas.SetHexColor(models.Colors[int(RandomInt(0, len(models.Colors)-1))])
		canvas.SetDash(RandomInt(1, 6))
		canvas.QuadraticTo(RandomInt(-50, 50), RandomInt(0, imageHeight), imageWidth, RandomInt(0, imageHeight))
		canvas.Stroke()

		canvas.SetHexColor(models.Colors[int(RandomInt(0, len(models.Colors)-1))])

		face := truetype.NewFace(font, &truetype.Options{Size: RandomInt(48, 68)})
		canvas.SetFontFace(face)

		letterPos := RandomInt(50, imageHeight)

		canvas.DrawString(letter, startPixel, letterPos)
		canvas.DrawString(letter, startPixel-RandomInt(1, 5), letterPos+RandomInt(1, 5))

		canvas.DrawCircle(RandomInt(0, imageWidth), RandomInt(0, imageHeight), RandomInt(0, 25))
		canvas.Stroke()

		width, _ := canvas.MeasureString(letter)
		startPixel += width + RandomInt(0, 25)
	}

	buf := bytes.NewBuffer(nil)
	canvas.EncodePNG(buf)

	return buf
}
