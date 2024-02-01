# How to run the frontend

## The easiest way (with npm) -- RECOMMENDED

Run this once on the machine.
```bash
npm install
```

Start up your backend on a specific port.

Then run:
```bash
bash run-easy.sh [ITERATION] [BACKEND PORT]
```
and navigate to http://localhost:3000 to see the frontend.

For example:
```bash
bash run-easy.sh 2 5000
```

Once you have deployed your backend, update line 4 in `run-easy.sh` to contain your deployed backend url. For example, for a url `https://example.alwaysdata.net`, line 4 should be:
```bash
echo "var DEPLOYED_URL = 'https://example.alwaysdata.net'" >> build/config.js
```

To utilise this deployed backend, run:
```bash
bash run-easy.sh 3 0
```

## The complex way

Only complete this step if you're comfortable self-teaching yourself ReactJS.

Run this once on the machine.
```bash
npm install
```

Start up your backend on a specific port.

Then run:
```bash
bash run.sh [ITERATION] [BACKEND PORT] [FRONTEND PORT]
```

For example:
```bash
bash run.sh 2 5000 12345
```

Once you have deployed your backend, update line 4 in src/utils/constants.js to contain your deployed backend url. For example, for a url `https://example.alwaysdata.net`, line 4 should be:
```javascript
let deployedUrl = "https://example.alwaysdata.net";
```

To utilise this deployed backend, run:
```bash
./run.sh 3 0 [FRONTEND PORT]
```
