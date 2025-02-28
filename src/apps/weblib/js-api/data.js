import UnPivot from "./unpivot.js";

class DataRecord {
  constructor(chart, record) {
    this.chart = chart;
    this.record = record;

    return new Proxy(this, {
      get: (target, columnName) => {
        return target._getValue(columnName);
      },
    });
  }

  _getValue(columnName) {
    let col = this.chart._toCString(columnName);
    let ptr;
    let value;

    try {
      ptr = this.chart._call(this.chart.module._record_getValue)(
        this.record,
        col,
        true
      );

      if (ptr) {
        value = this.chart._fromCString(ptr);
      } else {
        ptr = this.chart._call(this.chart.module._record_getValue)(
          this.record,
          col,
          false
        );
        value = this.chart.module.getValue(ptr, "double");
      }
    } finally {
      this.chart.module._free(col);
    }
    return value;
  }
}

export default class Data {
  constructor(chart) {
    this.chart = chart;
  }

  set(obj) {
    if (!obj) {
      return;
    }

    if (UnPivot.isPivot(obj)) {
      if (this.is1NF(obj)) {
        throw new Error(
          "inconsistent data form: " +
            "series/records and dimensions/measures are both set."
        );
      } else {
        obj = UnPivot.convert(obj);
      }
    }

    if (obj.series) {
      if (!Array.isArray(obj.series)) {
        throw new Error("data series field is not an array");
      }

      for (const series of obj.series) {
        this.setSeries(series);
      }
    }

    if (obj.records) {
      if (!Array.isArray(obj.records)) {
        throw new Error("data records field is not an array");
      }

      let seriesList = this.chart.data.series;
      for (const record of obj.records) {
        this.addRecord(record, seriesList);
      }
    }

    if (obj.filter || obj.filter === null) {
      this.setFilter(obj.filter);
    }
  }

  addRecord(record, seriesList) {
    if (!Array.isArray(record)) {
      if (typeof record === "object" && record !== null) {
        record = this.recordObjectToArray(record, seriesList);
      } else throw new Error("data record is not an array or object");
    }

    let ptrs = new Uint32Array(record.length);
    for (let i = 0; i < record.length; i++) {
      let ptr = this.chart._toCString(String(record[i]).toString());
      ptrs[i] = ptr;
    }

    let ptrArrayLen = record.length * 4;

    let ptrArr = this.chart.module._malloc(ptrArrayLen);
    var ptrHeap = new Uint8Array(
      this.chart.module.HEAPU8.buffer,
      ptrArr,
      ptrArrayLen
    );
    ptrHeap.set(new Uint8Array(ptrs.buffer));

    try {
      this.chart._call(this.chart.module._data_addRecord)(
        ptrArr,
        record.length
      );
    } finally {
      for (let ptr of ptrs) {
        this.chart.module._free(ptr);
      }
      this.chart.module._free(ptrArr);
    }
  }

  recordObjectToArray(record, seriesList) {
    const result = [];

    seriesList.forEach((series) => {
      if (series.name in record) {
        result.push(record[series.name]);
      } else {
        result.push(series.type === "measure" ? 0 : "");
      }
    });

    return result;
  }

  setSeries(series) {
    if (!series.name) {
      throw new Error("missing series name");
    }

    if (!series.values) {
      series.values = [];
    }

    if (!series.type) {
      series.type = this.detectType(series.values);
    }

    if (series.type === "dimension") {
      this.addDimension(series.name, series.values);
    } else if (series.type === "measure") {
      this.addMeasure(series.name, series.values);
    } else {
      throw new Error("invalid series type: " + series.type);
    }
  }

  detectType(values) {
    if (Array.isArray(values) && values.length) {
      if (typeof values[0] === "number") {
        // number
        return "measure";
      } else if (values[0] === "" + values[0]) {
        // string
        return "dimension";
      }
    }

    return null;
  }

  addDimension(name, dimension) {
    if (typeof name !== "string" && !(name instanceof String)) {
      throw new Error("first parameter should be string");
    }

    if (!(dimension instanceof Array)) {
      throw new Error("second parameter should be an array");
    }

    let ptrs = new Uint32Array(dimension.length);
    for (let i = 0; i < dimension.length; i++) {
      if (
        typeof dimension[i] !== "string" &&
        !(dimension[i] instanceof String)
      ) {
        throw new Error("array element should be string");
      }

      let ptr = this.chart._toCString(dimension[i]);
      ptrs[i] = ptr;
    }

    let ptrArrayLen = dimension.length * 4;

    let ptrArr = this.chart.module._malloc(ptrArrayLen);
    var ptrHeap = new Uint8Array(
      this.chart.module.HEAPU8.buffer,
      ptrArr,
      ptrArrayLen
    );
    ptrHeap.set(new Uint8Array(ptrs.buffer));

    let cname = this.chart._toCString(name);

    try {
      this.chart._call(this.chart.module._data_addDimension)(
        cname,
        ptrArr,
        dimension.length
      );
    } finally {
      this.chart.module._free(cname);
      for (let ptr of ptrs) {
        this.chart.module._free(ptr);
      }
      this.chart.module._free(ptrArr);
    }
  }

  addMeasure(name, values) {
    if (typeof name !== "string" && !(name instanceof String)) {
      throw new Error("first parameter should be string");
    }

    if (!(values instanceof Array)) {
      throw new Error("second parameter should be an array");
    }

    let vals = new Float64Array(values);
    let valArrayLen = values.length * 8;

    let valArr = this.chart.module._malloc(valArrayLen);
    var valHeap = new Uint8Array(
      this.chart.module.HEAPU8.buffer,
      valArr,
      valArrayLen
    );

    valHeap.set(new Uint8Array(vals.buffer));

    let cname = this.chart._toCString(name);

    try {
      this.chart._call(this.chart.module._data_addMeasure)(
        cname,
        valArr,
        values.length
      );
    } finally {
      this.chart.module._free(cname);
      this.chart.module._free(valArr);
    }
  }

  setFilter(filter) {
    if (typeof filter === "function") {
      let callback = (ptr) => filter(new DataRecord(this.chart, ptr));
      let callbackPtrs = [this.chart.module.addFunction(callback, "ii")];
      let deleter = (ptr) => {
        if (ptr !== callbackPtrs[0])
          console.warn("Wrong pointer passed to destructor");
        this.chart.module.removeFunction(callbackPtrs[0]);
        this.chart.module.removeFunction(callbackPtrs[1]);
      };
      callbackPtrs.push(this.chart.module.addFunction(deleter, "vi"));
      this.chart._call(this.chart.module._chart_setFilter)(...callbackPtrs);
    } else if (filter === null) {
      this.chart._call(this.chart.module._chart_setFilter)(0, 0);
    } else {
      throw new Error("data filter is not a function or null");
    }
  }

  is1NF(data) {
    return data.series || data.records;
  }
}
