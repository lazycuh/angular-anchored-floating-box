import { Component, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { delayBy, extractTextContent, findElementBySelector, getElementBySelector } from '../test-utils';

import { AnchoredFloatingBoxService } from './anchored-floating-box.service';
import { AnchoredFloatingBoxConfiguration } from './anchored-floating-box-configuration';
import { Theme } from './theme';

@Component({
  selector: 'lc-test',
  template: `
    <button
      #button
      type="button">
      Click me
    </button>
    <ng-template
      #template
      let-name>
      <span>Hello {{ name }}</span>
    </ng-template>
  `
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class TestComponentRenderer {
  @ViewChild('button')
  // eslint-disable-next-line @stylistic/indent
  anchorRef!: ElementRef<HTMLButtonElement>;

  @ViewChild('template', { read: TemplateRef })
  // eslint-disable-next-line @stylistic/indent
  templateRef!: TemplateRef<Record<string, unknown>>;

  constructor(readonly service: AnchoredFloatingBoxService) {}

  openAnchoredFloatingBox(config: Partial<AnchoredFloatingBoxConfiguration> = {}) {
    return this.service.open({
      anchor: this.anchorRef.nativeElement,
      content: this.templateRef,
      context: {
        $implicit: 'World'
      },
      ...config
    });
  }
}

describe('AnchoredFloatingBoxService', () => {
  const classSelectorPrefix = '.lc-anchored-floating-box';
  let fixture: ComponentFixture<TestComponentRenderer>;
  let testComponentRenderer: TestComponentRenderer;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponentRenderer],
      providers: [AnchoredFloatingBoxService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponentRenderer);
    testComponentRenderer = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('Should open a floating box whose content\'s innerHTML is "<span>Hello World</span>"', () => {
    testComponentRenderer.openAnchoredFloatingBox();

    fixture.detectChanges();

    expect(findElementBySelector(`${classSelectorPrefix}-container.enter`)).not.toBeNull();
    expect(getElementBySelector(`${classSelectorPrefix}__content`).innerHTML).toBe('<span>Hello World</span>');
  });

  it('Should render components as content', () => {
    @Component({
      selector: 'lc-test-content-component',
      template: '<p>Test content</p>'
    })
    class TestContentComponent {}

    testComponentRenderer.openAnchoredFloatingBox({
      content: TestContentComponent
    });

    fixture.detectChanges();

    expect(extractTextContent(`${classSelectorPrefix}__content`).trim()).toEqual('Test content');
  });

  it('Should invoke the provided after opened listener after the floating box is opened', async () => {
    const ref = testComponentRenderer.openAnchoredFloatingBox();
    const afterOpenedSpy = jasmine.createSpy();

    ref.addAfterOpenedListener(afterOpenedSpy);

    fixture.detectChanges();

    await delayBy(500);

    expect(afterOpenedSpy).toHaveBeenCalledTimes(1);
  });

  it('Should invoke the provided after closed listener after the floating box is closed', async () => {
    const ref = testComponentRenderer.openAnchoredFloatingBox();
    const afterClosedSpy = jasmine.createSpy();

    ref.addAfterClosedListener(afterClosedSpy);

    fixture.detectChanges();

    ref.close();

    fixture.detectChanges();

    await delayBy(500);

    expect(afterClosedSpy).toHaveBeenCalledTimes(1);
  });

  it('Should close the floating box when the return ref invokes `close`', async () => {
    const ref = testComponentRenderer.openAnchoredFloatingBox();

    fixture.detectChanges();

    ref.close();

    fixture.detectChanges();

    await delayBy(500);

    expect(findElementBySelector(`${classSelectorPrefix}-container`)).toBeNull();
  });

  it('Should insert the rendered floating box as the direct child of body element', () => {
    testComponentRenderer.openAnchoredFloatingBox();

    fixture.detectChanges();

    expect(document.body.lastElementChild).toEqual(getElementBySelector(`${classSelectorPrefix}-container`));
  });

  it('Should use light theme by default', () => {
    testComponentRenderer.openAnchoredFloatingBox();

    fixture.detectChanges();

    expect(findElementBySelector(`${classSelectorPrefix}.dark`)).toBeNull();
    expect(findElementBySelector(`${classSelectorPrefix}.light`)).not.toBeNull();
  });

  it('Should render with the provided theme', () => {
    testComponentRenderer.openAnchoredFloatingBox({ theme: Theme.DARK });

    fixture.detectChanges();

    expect(findElementBySelector(`${classSelectorPrefix}.light`)).toBeNull();
    expect(findElementBySelector(`${classSelectorPrefix}.dark`)).not.toBeNull();
  });

  it('Should render with the provided context', () => {
    testComponentRenderer.openAnchoredFloatingBox({ context: { $implicit: 'Angular' } });

    fixture.detectChanges();

    expect(extractTextContent(`${classSelectorPrefix}__content`)).toEqual('Hello Angular');
  });

  it('Should add the provided class name', () => {
    testComponentRenderer.openAnchoredFloatingBox({ className: 'hello-world' });

    fixture.detectChanges();

    expect(findElementBySelector(`${classSelectorPrefix}-container.hello-world`)).not.toBeNull();
  });
});
