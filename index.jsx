import { createRoot } from "react-dom/client";
import htmlToReact from "html-to-react";

import App from "./App";

(function () {
  const template = document.createElement("template");
  template.innerHTML = `
    <div id='root'>
    </div>
  `;

  class ConnectButton extends HTMLElement {
    constructor() {
      super();
      this.observer = new MutationObserver(() => this.update());
      this.observer.observe(this, { attributes: true });

      // TODO: add shadow dom will cause problem of style scope

      // this.attachShadow({
      //   mode: "open",
      // });
      // this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
    mount() {
      const props = {
        ...this.getProps(this.attributes, App.propTypes),
        ...this.getEvents(App.propTypes || {}),
        children: this.parseHtmlToReact(this._innerHTML),
      };

      const container = this;
      this.root = createRoot(container);

      this.root.render(<App {...props} />);
    }
    unmount() {
      this.root.unmount();
    }
    getEvents(propTypes) {
      return Object.keys(propTypes)
        .filter((key) => /on([A-Z].*)/.exec(key))
        .reduce(
          (events, ev) => ({
            ...events,
            [ev]: (args) =>
              this.dispatchEvent(new CustomEvent(ev, { ...args })),
          }),
          {}
        );
    }
    parseHtmlToReact(html) {
      return html && new htmlToReact.Parser().parse(html);
    }
    connectedCallback() {
      this._innerHTML = this.innerHTML;
      this.mount();
    }
    disconnectedCallback() {
      this.unmount();
      this.observer.disconnect();
    }
    update() {
      this.unmount();
      this.mount();
    }
    getProps(attributes, propTypes) {
      propTypes = propTypes || {};
      return [...attributes]
        .filter((attr) => attr.name !== "style")
        .map((attr) => this.convert(propTypes, attr.name, attr.value))
        .reduce((props, prop) => ({ ...props, [prop.name]: prop.value }), {});
    }
    convert(propTypes, attrName, attrValue) {
      const propName = Object.keys(propTypes).find(
        (key) => key.toLowerCase() == attrName
      );
      let value = attrValue;
      if (attrValue === "true" || attrValue === "false")
        value = attrValue == "true";
      else if (!isNaN(attrValue) && attrValue !== "") value = +attrValue;
      else if (/^{.*}/.exec(attrValue)) value = JSON.parse(attrValue);
      return {
        name: propName ? propName : attrName,
        value: value,
      };
    }
  }

  customElements.define("connect-button", ConnectButton);
})();
