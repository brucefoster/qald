# QWERTY-Adjusted Levenshtein Distance algorythm on JS
Comes with a handy character-by-character strings comparison module.

## Installation & usage
Via npm:
```bash
npm i qald
```

To use on a Node app, import the library using `import` or `require` approach:
```js
import QALDistance from 'qald';

const qald = new QALDistance();
console.log(qald.compute('hootmal.com', 'hotmail.com'));
```

Or use on the web: either import the library as a module or just load it as a regular script:
```html
<script src="dist/qald.min.js"></script>

<script>
    const qald = new QALDistance();
    console.log(qald.compute('hootmal.com', 'hotmail.com'));
</script>
```

## How does this work
Let's take a look on a basic calulation of Levenshtein distance:
```js
some_levenshtein_algo('glum', 'drum');
// Distance: 2
```
But in some scenarios we don't need just a distance. We want to know, how many typos the user has made and how severe they are.
So now let's calulate the distance based on QWERTY (or AZERTY, or any other) keyboard layout:
```js
qald.compute('glum', 'drum');

/* 
Result:
{
    "distance": 8,
    "changes": {
        "0": {
            "chars": [
                "d"
            ],
            "type": "replacement"
        },
        "1": {
            "chars": [
                "r"
            ],
            "type": "replacement"
        }
    },
    "comparison": "<u>d</u><u>r</u>um"
}
*/
```
For each replacement this algorithm calculates the distance between the keys on the keyboard and increases the resulting distance by that number.

This logic works only for replacements. When the algo detects additions and deletions of characters, the distance remains the same as typical Levenshtein implementation: 
```js
qald.compute('mial.com', 'mail.com');

/* 
Result:
{
    "distance": 2,
    "changes": {
        "0": {
            "chars": [
                "a"
            ],
            "type": "insertion"
        },
        "2": {
            "chars": [
                "a"
            ],
            "type": "deletion"
        }
    },
    "comparison": "mil.com"
}
*/
```

## Configuration
You can optionally override some options when initializing the GAP Distance class:
```js
const opts = {
    // Adjust typical misspells for your needs.
    // The keyboard distance between these characters will always end up to 1.
    misspells: {
        "a": "o",
        "e": "a",
    },

    // Pick the right keyboard layout for your user's location.
    // Available layouts are: 
    // — "qwerty" (default)
    // — "azerty"
    // — "йцукен" (cyrillic)
    layout: "qwerty",

    // Tell the library how to output changes (or disable it if you don't need them).
    comparer: {
        enabled: true,

        // Pass a function that returns a wrapped value 
        // or pass false to disable output for a specific type of change.
        // These settings are default.
        tags: {
            addition: (k) => `<u>${k}</u>`,
            deletion: false,
            replacement: (k) => `<u>${k}</u>`
        }
    }
}
const qald = new QALDistance(opts);
```

## Contribution & Support
Feel free to make a PR or [to open an issue](https://github.com/brucefoster/qald/issues/new) if you're facing troubles.