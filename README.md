
# Spectral Rule Checker

A quick POC for a tool to help create rules for [@stoplight/spectral](https://github.com/stoplightio/spectral)

Output is TAP compatible, hinting at eventual integration into a CI pipeline

Sample run happy path:
```
# npm start

> spectra-rule-checker@0.1.0 start /home/davidhoppe/dev/spectra-rule-checker
> node check.js

1..N
ok - rules/examples/ruleset1/000_verybad.json
ok - rules/examples/ruleset1/001_happypath.json
ok - rules/examples/ruleset1/002_missing_x-tag-info.json
```

Sample output with failing example:
```
> spectra-rule-checker@0.1.0 start /home/davidhoppe/dev/spectra-rule-checker
> node check.js

1..N
ok - rules/examples/ruleset1/000_verybad.json
ok - rules/examples/ruleset1/002_missing_x-tag-info.json
not ok - rules/examples/ruleset1/001_happypath.json
# [
# + 0: {"code":"x-tag-info-must-be-in-info","message":"x.y.z - x-tag-info must be in $.info","path":["info"],"severity":0,"range":{"start":{"line":2,"character":9},"end":{"line":7,"character":40}}}
# ]
```


### Adding a new example:
1. copy happy path example to a new example file
1. modify the copied example to show the desired behavior 
1. run the checker and check that the result in the actual result file
1. fix either the rules or the example until the results are as expected
1. rename the actual result file to be the expected result
1. run again to see it pass
1. repeat until the full ruleset is developed

