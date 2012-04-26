# github.js
- Revise github.widget.person to have a smaller code size. Implement the list
template more akin to github.widget.person.

- Abstract out the template of activities (events) found in github.widget.person
to its own function. That way github.widget.person could implement it cleaner and
github.widget.activities/events can exist.