export default class Events {
  constructor(vizzu) {
    this.vizzu = vizzu;
    this.module = vizzu.module;
    this.eventHandlers = new Map();
  }

  add(eventName, handler) {
    if (eventName !== "" + eventName) {
      throw new Error("first parameter should be string");
    }

    if (!this.eventHandlers.has(eventName)) {
      let func = (param) => {
        this._invoke(eventName, param);
      };
      let cfunc = this.module.addFunction(func, "vi");
      let cname = this.vizzu._toCString(eventName);
      this.eventHandlers.set(eventName, [cfunc, []]);

      try {
        this.vizzu._call(this.module._addEventListener)(cname, cfunc);
      } finally {
        this.module._free(cname);
      }
    }
    this.eventHandlers.get(eventName)[1].push(handler);
  }

  remove(eventName, handler) {
    if (eventName !== "" + eventName) {
      throw new Error("first parameter should be string");
    }

    if (!this.eventHandlers.has(eventName))
      throw new Error("unknown event handler");

    let [cfunc, handlers] = this.eventHandlers.get(eventName);

    handlers.find((o, i) => {
      if (o === handler) {
        handlers.splice(i, 1);
        return true;
      }
      return false;
    });

    if (handlers.length === 0) {
      let cname = this.vizzu._toCString(eventName);
      try {
        this.vizzu._call(this.module._removeEventListener)(cname, cfunc);
      } finally {
        this.module._free(cname);
      }
      this.module.removeFunction(cfunc);
      this.eventHandlers.delete(eventName);
    }
  }

  _invoke(eventName, param) {
    try {
      if (this.eventHandlers.has(eventName)) {
        let jsparam = this.vizzu._fromCString(param);

        for (const handler of [...this.eventHandlers.get(eventName)[1]]) {
          let eventParam = JSON.parse(jsparam);
          eventParam.preventDefault = () => {
            this.vizzu._call(this.module._event_preventDefault)();
          };
          if (eventParam.data?.markerId) {
            eventParam.data.getMarker = this._getMarkerProxy(
              eventParam.data.markerId
            );
          }
          if (
            eventParam.event.endsWith("-draw") ||
            eventParam.event.startsWith("draw-")
          ) {
            eventParam.renderingContext = this.vizzu.render.dc();
          }

          handler(eventParam);
        }
      }
    } catch (e) {
      console.log("exception in event handler: " + e);
    }
  }

  _getMarkerProxy(markerId) {
    let markerData = null;
    return () => {
      if (!markerData) {
        let cStr = this.vizzu._call(this.vizzu.module._chart_markerData)(
          markerId
        );
        markerData = JSON.parse(this.vizzu.module.UTF8ToString(cStr));
      }
      return markerData;
    };
  }
}
