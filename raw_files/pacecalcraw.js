"use strict";
(self.webpackChunkjam = self.webpackChunkjam || []).push([
  [651],
  {
    6: (e, t, s) => {
      s.d(t, {
        A: () => i,
      });
      const r = function (e, t) {
        let s =
          2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : {};
        window.dispatchEvent(
          new CustomEvent("fre-send-event", {
            detail: {
              eventType: e,
              event: t,
              data: s,
            },
          })
        ),
          window.freGaEventsReady || (window.freGaEventsReady = []),
          window.freGaEventsReady.push({
            eventType: e,
            event: t,
            data: s,
          });
      };
      class i extends HTMLElement {
        constructor() {
          super(),
            (this.shadow = this.attachShadow({
              mode: "open",
            }));
        }
        get name() {
          return this.getAttribute("data-data-name");
        }
        sendTrackingEvent(e, t, s) {
          const i = {
            action: e,
            name: t,
            userExperience: this.userExperience,
            input: s,
          };
          r("jamInteractiveContent", "event", i);
        }
        connectedCallback() {
          this.renderContent();
        }
        getContent() {
          return null;
        }
        renderContent() {
          const e = this.getContent();
          if (e) {
            const t = new DOMParser().parseFromString(
              e,
              "text/html"
            ).documentElement;
            this.shadow.appendChild(t);
          }
        }
      }
    },
    315: (e, t, s) => {
      s.r(t),
        s.d(t, {
          default: () => l,
        });
      var r = s(6);
      const i = (e) => !e || (Number.isInteger(e) && 0 < e),
        n = (e) => 29.54 + 5.000663 * e - 0.007546 * e * e,
        a = function (e) {
          const t =
              (1 / e) *
              (!!(1 < arguments.length && void 0 !== arguments[1]) &&
              arguments[1]
                ? 1609
                : 1e3),
            s = Math.floor(t),
            r = Math.floor(60 * (t - s));
          return `${s}:${9 < r ? "" : "0"}${r}`;
        };
      class l extends r.A {
        constructor() {
          super(),
            (this.handleReset = this.handleReset.bind(this)),
            (this.handleSubmit = this.handleSubmit.bind(this));
        }
        get form() {
          return (
            this._form || (this._form = this.shadow.querySelector("#form")),
            this._form
          );
        }
        get formError() {
          return (
            this._formError ||
              (this._formError = this.shadow.querySelector("#form-error")),
            this._formError
          );
        }
        get formWrapper() {
          return (
            this._formWrapper ||
              (this._formWrapper = this.shadow.querySelector("#form-wrapper")),
            this._formWrapper
          );
        }
        get resultsWrapper() {
          return (
            this._resultsWrapper ||
              (this._resultsWrapper =
                this.shadow.querySelector("#results-wrapper")),
            this._resultsWrapper
          );
        }
        get resultDistance() {
          return (
            this._resultDistance ||
              (this._resultDistance =
                this.shadow.querySelector("#result-distance")),
            this._resultDistance
          );
        }
        get resultDistanceUnit() {
          return (
            this._resultDistanceUnit ||
              (this._resultDistanceUnit = this.shadow.querySelector(
                "#result-distance-unit"
              )),
            this._resultDistanceUnit
          );
        }
        get resultTime() {
          return (
            this._resultTime ||
              (this._resultTime = this.shadow.querySelector("#result-time")),
            this._resultTime
          );
        }
        get resultItems() {
          return (
            this._resultItems ||
              (this._resultItems = this.shadow.querySelector("#result-items")),
            this._resultItems
          );
        }
        get reviseBtn() {
          return (
            this._reviseBtn ||
              (this._reviseBtn = this.shadow.querySelector("#revise-btn")),
            this._reviseBtn
          );
        }
        get submitBtn() {
          return (
            this._submitBtn ||
              (this._submitBtn = this.shadow.querySelector("#submit-btn")),
            this._submitBtn
          );
        }
        getContent() {
          return '<html lang="en"> <head> <style>*{box-sizing:border-box}body,html{margin:0;padding:0}input,label,select{display:block;font-size:1rem;line-height:1.3}input,select{appearance:none;-moz-appearance:none;-webkit-appearance:none;background:#fff;border-radius:.1875rem;border:1px solid #bbb;box-shadow:inset 0 0 0 0 #59e7ed;height:1.75rem;padding:0 .325rem;transition:box-shadow .2s ease-in-out;width:100%}input:focus,select:focus{outline:0;box-shadow:inset 0 -3px 0 -1px #59e7ed;border-radius:.1875rem .1875rem 1px 1px}select{background:#fff url("data:image/svg+xml;charset=UTF-8,%3csvg width=\'8px\' height=\'14px\' viewBox=\'0 0 8 17\' xmlns=\'http://www.w3.org/2000/svg\' fill=\'%238A8A8A\'%3e%3cpolygon fill=\'%238A8A8A\' points=\'4 17 0 10 8 10\'%3e%3c/polygon%3e%3cpolygon fill=\'%238A8A8A\' points=\'4 0 0 7 8 7\'%3e%3c/polygon%3e%3c/svg%3e") right 4px center no-repeat;padding:0 .9375rem 0 .325rem}select:-moz-focusring{color:transparent;text-shadow:0 0 0 #000}select::-ms-expand{display:none}.wrapper{background:#f3f3f3;font-family:Helvetica Neue,Helvetica,Arial,sans-serif;font-size:1rem;line-height:1.3;padding:.625rem}.form-wrapper.hide{display:none}.form-group{display:flex;flex-direction:column;gap:1rem;margin-bottom:1rem}.field-wrapper{flex:1}.field-container{display:flex}.field{flex:1}.field+.field{margin-left:.1875rem}.field-secondary{flex:0;min-width:fit-content}.label{display:block;font-size:.875rem;font-weight:700;line-height:1.4}.field .label{font-size:.75rem;color:#999}.btn-wrapper{flex:1;margin-top:1rem}.submit-btn{background:#59e7ed;border-radius:.1875rem;border:0;box-shadow:1px 1px 1px 0 rgba(0,0,0,.15);color:#000;cursor:pointer;display:block;font-size:1rem;font-weight:600;height:1.75rem;width:100%}.submit-btn:focus,.submit-btn:hover{background:#2be0e8;box-shadow:2px 2px 3px 0 rgba(0,0,0,.3);outline:0}.submit-btn:active{box-shadow:none}.form-error{background-color:#ffd5d5;color:#c1000b;font-size:.875rem;margin-bottom:.5rem;padding:.1875rem;text-align:center}.form-error.hide{display:none}.results-wrapper{display:flex}.results-wrapper.hide{display:none}.results{display:flex;flex-direction:column;max-width:40.625rem;margin:auto;flex:1}.result-head{margin:1.5rem 0 .4rem;font-size:1.3rem}.result-inputs{display:flex;gap:1rem}.result-item{margin:.2rem 0}.result-label{font-weight:700;color:#007bff}.result-value{font-weight:700;color:#28a745}.revise-wrapper{display:flex;width:100%;padding:.625rem}.revise-btn{font-size:.875rem;color:#aaa;margin-left:auto;cursor:pointer}.revise-btn:hover{color:#9951ff}@media (min-width:40.625rem){.form-group{flex-direction:row;margin-bottom:0}.btn-wrapper{margin-top:1.2rem}}</style> </head> <body> <div class="wrapper"> <div id="form-error" class="form-error hide"></div> <div id="form-wrapper" class="form-wrapper hide2"> <form id="form"> <div class="form-group"> <div class="field-wrapper"> <label for="race-length" class="label">Recent race length (eg. 26.2):</label> <div class="field-container"> <div class="field"> <input type="text" name="race-length" id="race-length" inputmode="numeric" pattern="[0-9]+(\\.[0-9]+)"/> </div> <div class="field field-secondary"> <select name="race-length-unit"> <option value="km" selected="selected">Kilometres</option> <option value="male">Miles</option> </select> </div> </div> </div> <div class="field-wrapper"> <label for="hours" class="label">My time:</label> <div class="field-container"> <div class="field"> <input type="text" name="hours" id="hours" inputmode="numeric" pattern="[0-9]*"/> <label for="hours" class="label">Hours</label> </div> <div class="field"> <input type="text" name="minutes" id="minutes" inputmode="numeric" pattern="[0-9]*"/> <label for="minutes" class="label">Minutes</label> </div> <div class="field"> <input type="text" name="seconds" id="seconds" inputmode="seconds" pattern="[0-9]*"/> <label for="seconds" class="label">Seconds</label> </div> </div> </div> </div> <div class="form-group"> <div class="field-wrapper"> <div class="field-container"> <div class="btn-wrapper"> <button id="submit-btn" class="submit-btn" type="button"> Calculate </button> </div> </div> </div> <div class="field-wrapper"> <label for="weight" class="label">Display my training paces in: </label> <div class="field-container"> <div class="field"> <select name="pace-unit" id="pace-unit"> <option value="mile" selected="selected">Min/Mile</option> <option value="km">Min/Km</option> </select> </div> </div> </div> </div> </form> </div> <div id="results-wrapper" class="results-wrapper hide"> <div class="results"> <h4 class="result-head">Your input:</h4> <div class="result-inputs"> <div class="result-input"> <span class="result-label">Distance:</span> <span id="result-distance" class="result-value"></span> <span id="result-distance-unit" class="result-unit"></span> </div> <div class="result-input"> <span class="result-label">Time:</span> <span id="result-time" class="result-value"></span> <span class="result-unit">h:m:s</span> </div> </div> <h4 class="result-head">Your training paces:</h4> <div id="result-items" class="result-items"></div> <div class="revise-wrapper"> <a id="revise-btn" class="revise-btn">revise</a> </div> </div> </div> </div> </body> </html> ';
        }
        handleReset(e) {
          e.preventDefault(),
            (this.resultItems.innerHTML = ""),
            this.formWrapper.classList.toggle("hide", !1),
            this.resultsWrapper.classList.toggle("hide", !0),
            this.formError.classList.toggle("hide", !0),
            this.form.reset();
        }
        createResultItems(e, t) {
          const s = "mile" === e,
            r = s ? "Min/Mile" : "Min/Km",
            i = n(0.7 * t),
            l = n(t);
          this.appendResultItem("Easy Run Training Pace:", a(i, s), r),
            this.appendResultItem(
              "Tempo Run Training Pace:",
              a(n(0.88 * t), s),
              r
            ),
            this.appendResultItem("VO2-Max Training Pace:", a(l, s), r),
            this.appendResultItem(
              "Speed Form Training Pace:",
              a(n(1.1 * t), s),
              r
            ),
            this.appendResultItem(
              "Long Run Training Pace:",
              `${a(i, s)} - ${a(n(0.6 * t), s)}`,
              r
            ),
            this.appendResultItem(
              "Yasso 800s Training Pace:",
              a(1.95 * l, !0),
              "Min/800"
            );
        }
        handleSubmit(e) {
          e.preventDefault();
          const t = Object.fromEntries(new FormData(this.form).entries());
          let s = +t["race-length"];
          const r = t["race-length-unit"],
            n = +t.hours,
            a = +t.minutes,
            l = +t.seconds;
          if (!s || 0 >= s)
            return void this.showError("Please input a valid race length.");
          if (!i(n) || !i(a) || !i(l))
            return void this.showError("Please input a valid time.");
          const o = 60 * n + a + l / 60;
          if (0 >= o) return void this.showError("Please input a valid time.");
          s *= "km" === r ? 1e3 : 1609;
          const d =
            ((e) => 0.182258 * e - 4.6 + 104e-6 * e * e)(s / o) /
            ((e) =>
              0.8 +
              0.1894393 * Math.exp(-0.012778 * e) +
              0.2989558 * Math.exp(-0.1932695 * e))(o);
          return 0 >= d
            ? void this.showError("Please input a valid race length and time.")
            : (this.createResultItems(t["pace-unit"], d),
              void this.showResults(t));
        }
        renderContent() {
          super.renderContent(),
            this.submitBtn.addEventListener("click", this.handleSubmit),
            this.reviseBtn.addEventListener("click", this.handleReset);
        }
        showError(e) {
          (this.formError.innerHTML = e),
            this.formError.classList.toggle("hide", !1);
        }
        showResults(e) {
          (this.resultDistance.innerHTML = e["race-length"]),
            (this.resultDistanceUnit.innerHTML =
              "km" === e["race-length-unit"] ? "Kilometres" : "Miles"),
            (this.resultTime.innerHTML = `${e.hours}:${e.minutes}:${e.seconds}`),
            this.resultsWrapper.classList.toggle("hide", !1),
            this.formWrapper.classList.toggle("hide", !0),
            this.formError.classList.toggle("hide", !0);
        }
        appendResultItem(e, t, s) {
          const r = document.createElement("div");
          r.classList.add("result-item"),
            (r.innerHTML = `<span class="result-label">${e}</span> <span class="result-value">${t}</span> <span class="result-unit">${s}</span>`),
            this.resultItems.appendChild(r);
        }
      }
    },
  },
]);
