```mermaid
classDiagram

main --|> events

commands --|> Info
commands --|> Link

commands --|> Up
Captcha --|> Up

Colors --|> Captcha

events --|> MessageCreate
events --|> IteractionCreate

IteractionCreate --|> sdccommands

models *-- Colors

service *-- Captcha
service *-- Random int

Random Int --|> Capcha
```
