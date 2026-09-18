package utils

import (
	"fmt"
	"log"
)

func Log(msg string, args ...interface{}) {
	if len(args) == 0 {
		log.Println(msg)
		return
	}
	log.Println(fmt.Sprintf(msg, args...))
}
