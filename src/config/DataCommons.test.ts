import { DataCommons } from "./DataCommons";

// NOTE: We're asserting that the DataCommons array is sorted alphabetically by name
// at the static configuration level. This requirement is dictated by CRDCDH-1235.
it("should be sorted alphabetically", () => {
  const sortedDataCommons = [...DataCommons].sort((a, b) => a.name.localeCompare(b.name));
  expect(DataCommons).toEqual(sortedDataCommons);
});
