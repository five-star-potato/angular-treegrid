import { ViewContainerRef, Component, Directive, Input, ComponentMetadata, ReflectiveInjector, Compiler } from "@angular/core";

@Directive({
  selector: '[componentOutlet]',
})
export class ComponentOutlet {
  @Input('componentOutlet') private template: string;
  @Input('componentOutletSelector') private selector: string;
  @Input('componentOutletContext') private context: Object;

  constructor(private vcRef: ViewContainerRef, private compiler: Compiler) { }

  private _createDynamicComponent() {
    this.context = this.context || {};

    const metadata = new ComponentMetadata({
      selector: this.selector,
      template: this.template,
    });

    let cmpClass = class _ { };
    cmpClass.prototype = this.context;
    return Component(metadata)(cmpClass);
  }

  ngOnChanges() {
    if (!this.template) return;
    this.compiler.compileComponentAsync(this._createDynamicComponent())
      .then(factory => {
        const injector = ReflectiveInjector.fromResolvedProviders([], this.vcRef.parentInjector);
        this.vcRef.clear();
        this.vcRef.createComponent(factory, 0, injector);
      });
  }
}