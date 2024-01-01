import { Component, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { assertThat, delayBy, fireEvent, getElementBySelector } from '@babybeet/angular-testing-kit';

import { AnchoredFloatingBoxService } from './anchored-floating-box.service';
import { AnchoredFloatingBoxConfiguration } from './anchored-floating-box-configuration';

@Component({
  selector: 'bbb-test',
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
class TestBedComponent {
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
  const classSelectorPrefix = '.bbb-anchored-floating-box';
  let fixture: ComponentFixture<TestBedComponent>;
  let testBedComponent: TestBedComponent;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TestBedComponent],
      providers: [AnchoredFloatingBoxService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestBedComponent);
    testBedComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('Should open a floating box whose content\'s innerHTML is "<span>Hello World</span>"', async () => {
    testBedComponent.openAnchoredFloatingBox();

    fixture.detectChanges();

    await delayBy(500);

    assertThat(`${classSelectorPrefix}-container.enter`).exists();
    assertThat(`${classSelectorPrefix}__content`).hasInnerHtml('<span>Hello World</span>');
  });

  it('Should render components as content', () => {
    @Component({
      selector: 'bbb-test-content-component',
      template: '<p>Test content</p>'
    })
    class TestContentComponent {}

    testBedComponent.openAnchoredFloatingBox({
      content: TestContentComponent
    });

    fixture.detectChanges();

    assertThat(`${classSelectorPrefix}__content`).hasTextContent('Test content');
  });

  it('Should invoke the provided after opened listener after the floating box is opened', async () => {
    const ref = testBedComponent.openAnchoredFloatingBox();
    const afterOpenedSpy = jasmine.createSpy();

    ref.addAfterOpenedListener(afterOpenedSpy);

    fixture.detectChanges();

    await delayBy(500);

    expect(afterOpenedSpy).toHaveBeenCalledTimes(1);
  });

  it('Should invoke the provided after closed listener after the floating box is closed', async () => {
    const ref = testBedComponent.openAnchoredFloatingBox();
    const afterClosedSpy = jasmine.createSpy();

    ref.addAfterClosedListener(afterClosedSpy);

    fixture.detectChanges();

    await delayBy(500);

    ref.close();

    fixture.detectChanges();

    await delayBy(500);

    expect(afterClosedSpy).toHaveBeenCalledTimes(1);
  });

  it('Should close the floating box when the return ref invokes `close`', async () => {
    const ref = testBedComponent.openAnchoredFloatingBox();

    fixture.detectChanges();

    await delayBy(500);

    ref.close();

    fixture.detectChanges();

    await delayBy(500);

    assertThat(`${classSelectorPrefix}-container`).doesNotExist();
  });

  it('Should insert the rendered floating box as the direct child of body element', () => {
    testBedComponent.openAnchoredFloatingBox();

    fixture.detectChanges();

    expect(document.body.lastElementChild).toEqual(getElementBySelector(`${classSelectorPrefix}-container`));
  });

  it('Should use light theme by default', () => {
    testBedComponent.openAnchoredFloatingBox();

    fixture.detectChanges();

    assertThat(`${classSelectorPrefix}.dark`).doesNotExist();
    assertThat(`${classSelectorPrefix}.light`).exists();
  });

  it('Should be able to configure a different default theme', async () => {
    testBedComponent.openAnchoredFloatingBox();

    fixture.detectChanges();

    assertThat(`${classSelectorPrefix}.dark`).doesNotExist();
    assertThat(`${classSelectorPrefix}.light`).exists();

    await delayBy(500);

    fireEvent(`${classSelectorPrefix}__backdrop`, 'click');

    AnchoredFloatingBoxService.setDefaultTheme('dark');

    testBedComponent.openAnchoredFloatingBox();

    fixture.detectChanges();

    await delayBy(500);

    assertThat(`${classSelectorPrefix}.light`).doesNotExist();
    assertThat(`${classSelectorPrefix}.dark`).exists();

    // Set back to the expected default
    AnchoredFloatingBoxService.setDefaultTheme('light');
  });

  it('Should render with the provided theme', () => {
    testBedComponent.openAnchoredFloatingBox({ theme: 'dark' });

    fixture.detectChanges();

    assertThat(`${classSelectorPrefix}.light`).doesNotExist();
    assertThat(`${classSelectorPrefix}.dark`).exists();
  });

  it('Should render with the provided context', () => {
    testBedComponent.openAnchoredFloatingBox({ context: { $implicit: 'Angular' } });

    fixture.detectChanges();

    assertThat(`${classSelectorPrefix}__content`).hasTextContentMatching(/\s*Hello Angular\s*/);
  });

  it('Should add the provided class name', () => {
    testBedComponent.openAnchoredFloatingBox({ className: 'hello-world' });

    fixture.detectChanges();

    assertThat(`${classSelectorPrefix}-container.hello-world`).exists();
  });
});
