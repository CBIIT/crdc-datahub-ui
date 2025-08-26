import type ExcelJS from "exceljs";

import * as utils from "./excelUtils";

describe("q", () => {
  it("quotes a string", () => {
    expect(utils.q("hello")).toBe('"hello"');
    expect(utils.q('say "hi"')).toBe('"say ""hi"""');
  });
});

describe("abs", () => {
  it("converts address to absolute", () => {
    expect(utils.abs("D2")).toBe("$D$2");
    expect(utils.abs("AA10")).toBe("$AA$10");
  });

  it("handles invalid input gracefully", () => {
    expect(utils.abs("")).toBe("");
  });
});

describe("refFromRow", () => {
  it("returns absolute reference for keyed cell", () => {
    const row = { getCell: (key: string) => ({ address: "D2" }) } as ExcelJS.Row;
    expect(utils.refFromRow(row, "email")).toBe("$D$2");
  });
});

describe("AND", () => {
  it("combines conditions", () => {
    expect(utils.AND("A1>0", "B1<10")).toBe("AND(A1>0,B1<10)");
  });
});

describe("OR", () => {
  it("combines conditions", () => {
    expect(utils.OR("A1=1", "A1=2")).toBe("OR(A1=1,A1=2)");
  });
});

describe("NOT", () => {
  it("negates condition", () => {
    expect(utils.NOT("A1=5")).toBe("NOT(A1=5)");
  });
});

describe("IF", () => {
  it("creates IF formula", () => {
    expect(utils.IF("A1>10", '"High"', '"Low"')).toBe('IF(A1>10,"High","Low")');
  });
});

describe("EQ", () => {
  it("checks equality", () => {
    expect(utils.EQ("A1", "B1")).toBe("A1=B1");
  });
});

describe("NEQ", () => {
  it("checks inequality", () => {
    expect(utils.NEQ("A1", "B1")).toBe("A1<>B1");
  });
});

describe("LT", () => {
  it("checks less than", () => {
    expect(utils.LT("A1", "10")).toBe("A1<10");
  });
});

describe("LTE", () => {
  it("checks less than or equal", () => {
    expect(utils.LTE("A1", "100")).toBe("A1<=100");
  });
});

describe("GT", () => {
  it("checks greater than", () => {
    expect(utils.GT("A1", "0")).toBe("A1>0");
  });
});

describe("GTE", () => {
  it("checks greater than or equal", () => {
    expect(utils.GTE("A1", "18")).toBe("A1>=18");
  });
});

describe("LEN", () => {
  it("returns length formula", () => {
    expect(utils.LEN("A1")).toBe("LEN(A1)");
  });
});

describe("TRIM", () => {
  it("returns trim formula", () => {
    expect(utils.TRIM("A1")).toBe("TRIM(A1)");
  });
});

describe("LEFT", () => {
  it("returns left formula", () => {
    expect(utils.LEFT("A1", 3)).toBe("LEFT(A1,3)");
  });
});

describe("MID", () => {
  it("returns mid formula", () => {
    expect(utils.MID("A1", 2, 3)).toBe("MID(A1,2,3)");
  });
});

describe("RIGHT", () => {
  it("returns right formula", () => {
    expect(utils.RIGHT("A1", 2)).toBe("RIGHT(A1,2)");
  });
});

describe("SUB", () => {
  it("returns substitute formula", () => {
    expect(utils.SUB("A1", "old", "new")).toBe('SUBSTITUTE(A1,"old","new")');
  });
});

describe("UPPER", () => {
  it("returns upper formula", () => {
    expect(utils.UPPER("A1")).toBe("UPPER(A1)");
  });
});

describe("VALUE", () => {
  it("returns value formula", () => {
    expect(utils.VALUE("A1")).toBe("VALUE(A1)");
  });
});

describe("ISNUMBER", () => {
  it("returns isnumber formula", () => {
    expect(utils.ISNUMBER("A1")).toBe("ISNUMBER(A1)");
  });
});

describe("SEARCH", () => {
  it("returns search formula", () => {
    expect(utils.SEARCH("@", "A1")).toBe('SEARCH("@",A1)');
  });
});

describe("CELL", () => {
  it("returns absolute cell address from string", () => {
    expect(utils.CELL("D2")).toBe("$D$2");
  });

  it("returns the cell address for an ExcelJS Cell value", () => {
    const mockCell = { address: "X92" } as ExcelJS.Cell;
    expect(utils.CELL(mockCell)).toBe("$X$92");
  });
});

describe("STR_EQ", () => {
  it("returns string equality formula", () => {
    expect(utils.STR_EQ("A1", "test")).toBe('$A$1="test"');
  });
});

describe("IN", () => {
  it("returns OR formula for values", () => {
    expect(utils.IN("A1", ["red", "blue"])).toBe('OR($A$1="red",$A$1="blue")');
  });
});

describe("REQUIRED", () => {
  it("returns required formula", () => {
    expect(utils.REQUIRED("A1")).toBe("LEN(TRIM($A$1))>0");
  });
});

describe("TEXT_MAX", () => {
  it("returns text max formula", () => {
    expect(utils.TEXT_MAX("A1", 50)).toBe("LEN($A$1)<=50");
  });
});

describe("TEXT_MIN", () => {
  it("returns text min formula", () => {
    expect(utils.TEXT_MIN("A1", 3)).toBe("LEN($A$1)>=3");
  });
});

describe("EMAIL", () => {
  it("returns email validation formula", () => {
    expect(utils.EMAIL("A1")).toEqual(
      `AND(ISNUMBER(SEARCH("@",$A$1)),ISNUMBER(SEARCH(".",$A$1)),LEN($A$1)-LEN(SUBSTITUTE($A$1,".",""))>=1,LEN($A$1)-LEN(SUBSTITUTE($A$1,"@",""))=1)`
    );

    expect(utils.EMAIL("D99")).toEqual(
      `AND(ISNUMBER(SEARCH("@",$D$99)),ISNUMBER(SEARCH(".",$D$99)),LEN($D$99)-LEN(SUBSTITUTE($D$99,".",""))>=1,LEN($D$99)-LEN(SUBSTITUTE($D$99,"@",""))=1)`
    );
  });
});

describe("ORCID", () => {
  it("returns ORCID validation formula", () => {
    expect(utils.ORCID("X4")).toEqual(
      `AND(LEN($X$4)=19,MID($X$4,5,1)="-",MID($X$4,10,1)="-",MID($X$4,15,1)="-",ISNUMBER(VALUE(LEFT($X$4,4))),ISNUMBER(VALUE(MID($X$4,6,4))),ISNUMBER(VALUE(MID($X$4,11,4))),ISNUMBER(VALUE(MID($X$4,16,3))),OR(ISNUMBER(VALUE(RIGHT($X$4,1))),UPPER(RIGHT($X$4,1))="X"))`
    );
  });
});

describe("UUIDV4", () => {
  it("returns UUID v4 validation formula", () => {
    expect(utils.UUIDV4("Y7")).toEqual(
      `AND(LEN($Y$7)=36,MID($Y$7,9,1)="-",MID($Y$7,14,1)="-",MID($Y$7,19,1)="-",MID($Y$7,24,1)="-",MID($Y$7,15,1)="4",OR(UPPER(MID($Y$7,20,1))="8",UPPER(MID($Y$7,20,1))="9",UPPER(MID($Y$7,20,1))="A",UPPER(MID($Y$7,20,1))="B"))`
    );
  });
});

describe("SHEET", () => {
  it("quotes sheet name", () => {
    expect(utils.SHEET("Sheet 1")).toBe("'Sheet 1'");
    expect(utils.SHEET("O'Brien")).toBe("'O''Brien'");
  });
});

describe("A1", () => {
  it("returns A1 address", () => {
    expect(utils.A1("b", 3)).toBe("B3");
  });
});

describe("ABS_ADDR", () => {
  it("returns absolute address", () => {
    expect(utils.ABS_ADDR("B", 3)).toBe("$B$3");
  });
});

describe("RANGE", () => {
  it("returns absolute range", () => {
    expect(utils.RANGE("B1", "B10")).toBe("$B$1:$B$10");
  });
});

describe("SHEET_RANGE", () => {
  it("returns sheet-qualified range", () => {
    expect(utils.SHEET_RANGE("My Sheet", "B1", "B10")).toBe("'My Sheet'!$B$1:$B$10");
  });
});

describe("LIST_FORMULA", () => {
  it("returns list formula", () => {
    expect(utils.LIST_FORMULA("My Sheet", "B", 1, 10)).toBe("='My Sheet'!$B$1:$B$10");
  });
});

describe("TODAY", () => {
  it("returns TODAY formula", () => {
    expect(utils.TODAY()).toBe("TODAY()");
  });
});

describe("DATE_NOT_BEFORE_TODAY", () => {
  it("returns date validation formula", () => {
    expect(utils.DATE_NOT_BEFORE_TODAY("A1", {})).toEqual("AND(ISNUMBER($A$1),$A$1>=TODAY())");
    expect(utils.DATE_NOT_BEFORE_TODAY("X4", { allowBlank: true })).toEqual(
      `OR(NOT(LEN(TRIM($X$4))>0),AND(ISNUMBER($X$4),$X$4>=TODAY()))`
    );
  });
});

describe("toYesNo", () => {
  it("returns Yes for true", () => {
    expect(utils.toYesNo(true)).toBe("Yes");
  });

  it("returns No for false", () => {
    expect(utils.toYesNo(false)).toBe("No");
  });

  it("returns null for null/undefined", () => {
    expect(utils.toYesNo(null)).toBeNull();
    expect(utils.toYesNo(undefined)).toBeNull();
  });
});
