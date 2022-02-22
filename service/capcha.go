package main

import (
	"fmt"
	"github.com/fogleman/gg"
	"github.com/golang/freetype/truetype"
	"golang.org/x/image/font/gofont/goregular"
	"math/rand"
	"strings"
	"time"
)

const imageWidth, imageHeight = 300, 80

var text = fmt.Sprintf("%v", int(randomInt(1000, 9999)))

var colors = [8]string{"FF6E4A", "B756D8", "F2FF40", "00B64F", "A62300", "C187D3", "4CA900", "007633"}

func main() {
	font, _ := truetype.Parse(goregular.TTF)

	startPixel := randomInt(20, 80)

	canvas := gg.NewContext(imageWidth, imageHeight)

	canvas.SetHexColor("202225")
	canvas.DrawRectangle(0, 0, imageWidth, imageHeight)
	canvas.Fill()

	for _, letter := range strings.Split(text, "") {
		canvas.MoveTo(0, randomInt(0, imageHeight))
		canvas.SetLineWidth(2)
		canvas.SetDash()
		canvas.SetHexColor(colors[int(randomInt(0, len(colors)-1))])
		canvas.QuadraticTo(randomInt(-50, 50), randomInt(0, imageHeight), imageWidth, randomInt(0, 80))
		canvas.Stroke()

		canvas.DrawCircle(randomInt(0, imageWidth), randomInt(0, imageHeight), randomInt(0, 25))
		canvas.Stroke()

		canvas.MoveTo(0, randomInt(0, imageHeight))
		canvas.SetLineWidth(3)
		canvas.SetHexColor(colors[int(randomInt(0, len(colors)-1))])
		canvas.SetDash(randomInt(1, 6))
		canvas.QuadraticTo(randomInt(-50, 50), randomInt(0, imageHeight), imageWidth, randomInt(0, 80))
		canvas.Stroke()

		canvas.SetHexColor(colors[int(randomInt(0, len(colors)-1))])

		face := truetype.NewFace(font, &truetype.Options{Size: randomInt(48, 68)})
		canvas.SetFontFace(face)

		letterPos := randomInt(40, 80)
		if randomInt(0, 1) == 0 {
			canvas.DrawString(letter, startPixel, letterPos)
			canvas.DrawString(letter, startPixel-3, letterPos+3)
		} else {
			canvas.DrawString(letter, startPixel, letterPos)
			canvas.DrawString(letter, startPixel+3, letterPos-3)
		}

		width, _ := canvas.MeasureString(letter)
		startPixel += width + randomInt(0, 25)

		fmt.Println(letter)
	}

	canvas.SavePNG("./result.png")
}

func randomInt(min int, max int) float64 {
	rand.Seed(time.Now().UnixNano())
	return float64(rand.Intn(max-min+1) + min)
}
