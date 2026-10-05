// Command worker is a placeholder per Part 2.2's cmd/worker structure. No
// domain currently produces async jobs that need a separate worker process
// — the booking module's side effects (email on payment confirmation) run
// synchronously today. This binary becomes real once a queue/ backend
// (Redis Streams, RabbitMQ) is introduced and a domain actually needs
// fire-and-forget job processing decoupled from the request/response
// cycle. Documented here rather than left unexplained so it's clear this
// is an intentional "not yet", not an oversight.
package main

import "fmt"

func main() {
	fmt.Println("kpr-tourism worker: no queued jobs registered yet — nothing to do")
}
