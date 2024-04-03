import * as utils from "./statisticUtils";

describe("compareNodeStats cases", () => {
  const node1A = { total: 1, nodeName: "NodeA" } as SubmissionStatistic;
  const node1B = { total: 1, nodeName: "NodeB" } as SubmissionStatistic;
  const node3A = { total: 3, nodeName: "AAA Node" } as SubmissionStatistic;
  const node3B = { total: 3, nodeName: "Node3" } as SubmissionStatistic;
  const node5 = { total: 5, nodeName: "Node5" } as SubmissionStatistic;

  it("should correctly sort in ascending order by node.total", () => {
    const sortedStats = [node3B, node1A, node5].sort(utils.compareNodeStats);

    expect(sortedStats).toEqual([node1A, node3B, node5]);
  });

  it("should correctly sort in ascending order by node.nodeName when node.total is equal", () => {
    const sortedStats = [node3B, node1A, node3A, node1B].sort(
      utils.compareNodeStats
    );

    expect(sortedStats).toEqual([node1A, node1B, node3A, node3B]);
  });
  it("should return >1 when a.total is greater than b.total", () => {
    const a = { total: 5, nodeName: "Node 1" } as SubmissionStatistic;
    const b = { total: 1, nodeName: "Node 2" } as SubmissionStatistic;

    expect(utils.compareNodeStats(a, b)).toBeGreaterThan(0);
  });

  it("should return >0 when a.nodeName comes after b.nodeName", () => {
    const a = { total: 1, nodeName: "Node 2" } as SubmissionStatistic;
    const b = { total: 1, nodeName: "Node 1" } as SubmissionStatistic;

    expect(utils.compareNodeStats(a, b)).toBeGreaterThan(0);
  });

  it("should return 0 when both nodes are equal 1/2", () => {
    const a = { total: 1, nodeName: "Node 1" } as SubmissionStatistic;
    const b = { total: 1, nodeName: "Node 1" } as SubmissionStatistic;

    expect(utils.compareNodeStats(a, b)).toEqual(0);
  });

  it("should return 0 when both nodes are equal 2/2", () => {
    const a = { total: 0, nodeName: "" } as SubmissionStatistic;
    const b = { total: 0, nodeName: "" } as SubmissionStatistic;

    expect(utils.compareNodeStats(a, b)).toEqual(0);
  });

  it("should return 0< when a.total is less than b.total", () => {
    const a = { total: 1, nodeName: "Node 1" } as SubmissionStatistic;
    const b = { total: 4, nodeName: "Node 2" } as SubmissionStatistic;

    expect(utils.compareNodeStats(a, b)).toBeLessThan(0);
  });

  it("should return 0< when a.nodeName comes before b.nodeName", () => {
    const a = { total: 1, nodeName: "Node 1" } as SubmissionStatistic;
    const b = { total: 1, nodeName: "Node 2" } as SubmissionStatistic;

    expect(utils.compareNodeStats(a, b)).toBeLessThan(0);
  });
});

describe("calculateMaxDomain cases", () => {
  it.each([-1, NaN, undefined, 0, Infinity, -Infinity])(
    "should default to 1 when dataMax is invalid (%s)",
    (dataMax) => {
      expect(utils.calculateMaxDomain(dataMax)).toBe(1);
    }
  );

  it("should round up to the nearest 1,000 when dataMax above 1,000", () => {
    expect(utils.calculateMaxDomain(1001)).toBe(2000);
    expect(utils.calculateMaxDomain(2500)).toBe(3000);
    expect(utils.calculateMaxDomain(10000)).toBe(10000);
    expect(utils.calculateMaxDomain(23949)).toBe(24000);
  });

  it("should round up to the nearest 100 when dataMax is between 100 and 1,000", () => {
    expect(utils.calculateMaxDomain(101)).toBe(200);
    expect(utils.calculateMaxDomain(550)).toBe(600);
    expect(utils.calculateMaxDomain(1000)).toBe(1000);
  });

  it("should round up to the nearest 10 when dataMax is between 10 and 100", () => {
    expect(utils.calculateMaxDomain(11)).toBe(20);
    expect(utils.calculateMaxDomain(55)).toBe(60);
    expect(utils.calculateMaxDomain(99)).toBe(100);
    expect(utils.calculateMaxDomain(100)).toBe(100);
  });

  it("should round up to the nearest 10 when dataMax is between 1 and 10", () => {
    expect(utils.calculateMaxDomain(1)).toBe(10);
    expect(utils.calculateMaxDomain(5)).toBe(10);
    expect(utils.calculateMaxDomain(10)).toBe(10);
  });
});
