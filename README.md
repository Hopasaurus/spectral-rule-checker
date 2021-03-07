
# Spectral Rule Checker

a quick POC for a tool to help create rules for [@stoplight/spectral](https://github.com/stoplightio/spectral)


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

