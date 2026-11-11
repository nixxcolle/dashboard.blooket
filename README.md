# Horse vs. Car — 25-rock quiz race
Open index.html in Antigravity or a modern browser. No build required.

Each of 25 numbered rocks has one fixed question, using the 25 supplied questions in order. Both groups automatically approach rock 1 at the start and its question pops up. Horse buzzes with A; car with L. The teacher selects the group's answer on the shared screen.

A correct answer automatically moves only that group to its next rock. Arrival automatically flashes that rock's question. No Next question or Move click is needed. If the trailing group catches up to an already visited rock, that rock's fixed question appears again. A wrong answer gives the other group a chance. If both miss, click Retry this rock; neither racer moves. A correct answer at rock 25 moves the answering group across the finish line to win.

The course has 25 explicit numbered rock markers. Questions do not shuffle. The game is teacher-operated on one shared computer, with touch/click buzzers or A/L keyboard keys.

The currency question assumes ₱63.20 per dollar (₱316 for $5), not a live quote. October 2026 inflation: 7.8%, per https://psa.gov.ph/content/summary-inflation-report-consumer-price-index-2018100-october-2026 .

Checks: node --check game.js and node verify.cjs. Verified all 25 fixed question mappings, automatic arrival popup/movement, first buzzer lock, catch-up mapping, retry, finish, and reset cancellation. Browser visual QA unavailable.
