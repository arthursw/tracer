# Tracer

An image tracer for Espero.

## Developer note

To run: `parcel index.html`

### [Parcel bug fix](https://github.com/parcel-bundler/parcel/issues/2408) for paper.js

Parcel does not accept double slash in strings ("//") ; so add a space between the two slashes on lines ~17211 and ~17215 (might change in futur versions) of nodes_modules/paper/dist/paper-full.js