# JuxtaposeJS 1.2.5

JavaScript and CSS originally downloaded from https://cdn.knightlab.com/libs/juxtapose/1.2.5/.
Source: https://github.com/NUKnightLab/juxtapose
License: MPL-2.0 (see LICENSE).

Hosted locally without the hosted embed wrapper or its analytics.

## Local maintenance changes

The upstream copyright and MPL-2.0 license are retained. The source is kept here
so these small modifications can be reviewed against version 1.2.5:

- Remove unused Flickr integration and its bundled API key. Image comparisons
  use direct image URLs; Flickr photo-page URLs are no longer supported.
- Use strict equality for comparisons with known types.
- Return simple boolean expressions directly and remove the unused viewport helper.
- Name vertical dimensions and shared before/after percentages consistently;
  keep percentage calculations local to their functions.
- Use an explicit bounds check in the legacy event-listener registry loop.
- Remove redundant zero units and duplicate CSS maximum-size declarations
  (the initial value of both maximum sizes is already `none`).

These changes preserve the slider's horizontal and vertical layout calculations.
