import programs, { OptionalProgram } from "./ProgramConfig";

describe("ProgramConfig test", () => {
  it("should should have the optional program at the last index", () => {
    expect(programs[programs.length - 1]).toEqual(OptionalProgram);
  });
});
