import { lambda, Format, uid } from '@node-lambdas/core';
import { TimedCache } from './cache.js';
import { map } from './mapper.js';

const cache = new TimedCache(3600);
setInterval(() => cache.purge(), 5000);

const configutation = {
  version: 2,
  actions: {
    create: {
      input: Format.Json,
      handler: (input, output) => {
        const mapperId = uid(16);
        cache.set(mapperId, input.body);

        output.pipeTo(`map --using=${mapperId}`);
      },
    },
    map: {
      default: true,
      input: Format.Json,
      output: Format.Json,
      handler: (input, output) => {
        const mapperId = input.options.using;
        const mapper = cache.get(mapperId);

        if (!mapper) {
          output.reject(`Mapper ${mapperId} not found`);
          return;
        }

        const mappedValue = map(input.body, mapper);
        cache.delete(mapperId);

        output.send(mappedValue);
      },
    },
  },
};

lambda(configutation);
