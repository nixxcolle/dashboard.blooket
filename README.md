# Countryside quiz race
Open index.html in a modern browser, or preview it in Antigravity. No build required.

Load questions before choosing a ride. Import a Blooket-format CSV with Question Text, Answer 1, Answer 2 (and optionally Answer 3/4), and Correct Answer(s) columns. Correct answers use one-based answer numbers. Alternatively paste one question per line: Question | Correct answer | Wrong answer | Wrong answer.

JSON format: [{"question":"Your question?","answers":["Correct","Incorrect"],"correct":[0]}]. JSON correct indexes are zero-based. Questions repeat if there are fewer than 22.

Hold Space or the accelerator to race. B boosts; P pauses. At each of 22 rocks, the race clock and opponent pause. Choose the correct answer and click Continue racing. Incorrect answers allow retry. Three boosts per race. Best winning times are saved in browser storage.

The linked Blooket set could not be retrieved in this session. Its questions are not bundled; import or paste them before playing.

Verification: node --check game.js and node verify.cjs in the source workspace. Race logic checks cover all checkpoints, paused time/opponent, incorrect/correct answers, race completion, restart, and CSV parsing. Visual browser QA was unavailable.
