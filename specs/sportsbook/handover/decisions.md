# Decisions

| ID | Question | Answer | Who |
|---|---|---|---|
| D-01 | Which site version is this? | V1 (live default). V2/V3 routes swap via `V3Switch`; ignore for this build. | CH |
| D-02 | Betslip colour mode? | Always dark, both page modes. | CH |
| D-03 | Carousels on touch? | Swipe only; no edge chevrons on touch. | CH |
| D-04 | Same market twice on one game? | Replace in place, toast "Replaced X with Y". | CH |
| D-05 | SGP pack tap when some legs already on the slip? | Pack replaces every leg on that game; other games untouched. Tap again removes the pack. | CH |
| D-06 | Does the slip open on add? | Desktop: first pick only (not when navigating). Mobile: never; dock counts up. | CH |
| D-07 | Price moves before place? | Re-price, show amber note + struck old price, button "Accept odds & place". | CH |
| D-08 | Over max risk? | Reject that bet only, keep it on the slip with a note; place the rest. | CH |
| D-09 | SGP pack with a suspended leg? | **Open — needs design.** Recommendation: disable the footer button and show the lock on that leg. | — |
| D-10 | My Bets load failure? | **Open — needs design.** Recommendation: card "Couldn't load your bets" + Retry. | — |
