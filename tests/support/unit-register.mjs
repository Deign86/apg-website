// `node --import ./tests/support/unit-register.mjs --test ...`: installs unit-loader.mjs hooks.
import { register } from 'node:module';

register('./unit-loader.mjs', import.meta.url);
