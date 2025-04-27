import {
  ChangeDetectionStrategy,
  Component,
  provideExperimentalZonelessChangeDetection,
  Type,
  viewChild
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { assertThat, delayBy, fireEvent } from '@lazycuh/angular-testing-kit';

import { AnchoredFloatingBox } from './anchored-floating-box.component';
import { TriggerFloatingBoxForDirective } from './trigger-floating-box-for.directive';

describe('<lc-anchored-floating-box />', () => {
  const classSelectorPrefix = '.lc-anchored-floating-box';

  async function render<T>(testBedComponent: Type<T>) {
    await TestBed.configureTestingModule({
      imports: [testBedComponent],
      providers: [provideExperimentalZonelessChangeDetection()]
    }).compileComponents();

    const fixture = TestBed.createComponent(testBedComponent);
    fixture.detectChanges();

    await delayBy(250);

    return fixture;
  }

  fit('Should not render the floating box without clicking the trigger first', async () => {
    @Component({
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [TriggerFloatingBoxForDirective, AnchoredFloatingBox],
      selector: 'lc-test',
      template: `
        <button
          id="click-me"
          [lcTriggerFloatingBoxFor]="floatingBox"
          type="button">
          Click me
        </button>

        <lc-anchored-floating-box #floatingBox>
          <span>Hello World</span>
        </lc-anchored-floating-box>
      `
    })
    class TestBedComponent {}
    await render(TestBedComponent);

    assertThat('#click-me').exists();
    assertThat(classSelectorPrefix).doesNotExist();
  });

  fit('Should render the floating box when the trigger is clicked', async () => {
    @Component({
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [TriggerFloatingBoxForDirective, AnchoredFloatingBox],
      selector: 'lc-test',
      template: `
        <button
          id="click-me"
          [lcTriggerFloatingBoxFor]="floatingBox"
          type="button">
          Click me
        </button>

        <lc-anchored-floating-box #floatingBox>
          <span>Hello World</span>
        </lc-anchored-floating-box>
      `
    })
    class TestBedComponent {}
    const fixture = await render(TestBedComponent);

    fireEvent('#click-me', 'click');

    fixture.detectChanges();

    assertThat(`${classSelectorPrefix}__content`).hasTextContentMatching(/Hello World/);

    fireEvent(`${classSelectorPrefix}__backdrop`, 'click');

    await delayBy(1000);

    assertThat(`${classSelectorPrefix}-container.is-leaving`).exists();
    fireEvent(classSelectorPrefix, 'animationend');
    await delayBy(1000);
  });

  it('Can set theme', async () => {
    @Component({
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [TriggerFloatingBoxForDirective, AnchoredFloatingBox],
      selector: 'lc-test',
      template: `
        <button
          id="click-me"
          [lcTriggerFloatingBoxFor]="floatingBox"
          type="button">
          Click me
        </button>

        <lc-anchored-floating-box
          #floatingBox
          theme="dark">
          <span>Hello World</span>
        </lc-anchored-floating-box>
      `
    })
    class TestBedComponent {}
    const fixture = await render(TestBedComponent);

    fireEvent('#click-me', 'click');

    fixture.detectChanges();

    assertThat(`${classSelectorPrefix}.dark-theme`).exists();
    assertThat(`${classSelectorPrefix}.light-theme`).doesNotExist();
  });

  it('Can set class name', async () => {
    @Component({
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [TriggerFloatingBoxForDirective, AnchoredFloatingBox],
      selector: 'lc-test',
      template: `
        <button
          id="click-me"
          [lcTriggerFloatingBoxFor]="floatingBox"
          type="button">
          Click me
        </button>

        <lc-anchored-floating-box
          #floatingBox
          class="custom-class">
          <span>Hello World</span>
        </lc-anchored-floating-box>
      `
    })
    class TestBedComponent {}
    const fixture = await render(TestBedComponent);

    fireEvent('#click-me', 'click');

    fixture.detectChanges();

    assertThat('.custom-class').exists();
  });

  fit('Can export directive under "floatingBoxRef" name', async () => {
    @Component({
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [TriggerFloatingBoxForDirective, AnchoredFloatingBox],
      selector: 'lc-test',
      template: `
        <button
          id="click-me"
          [lcTriggerFloatingBoxFor]="floatingBox"
          #floatingBoxRef="floatingBoxRef"
          type="button">
          Click me
        </button>

        <lc-anchored-floating-box #floatingBox>
          <span>Hi there!</span>
        </lc-anchored-floating-box>
      `
    })
    class TestBedComponent {
      floatingBoxRef = viewChild.required('floatingBoxRef', { read: TriggerFloatingBoxForDirective });
    }

    const fixture = await render(TestBedComponent);

    fireEvent('#click-me', 'click');

    fixture.detectChanges();

    assertThat(`${classSelectorPrefix}__content`).hasTextContentMatching(/Hi there!/);

    fixture.componentInstance.floatingBoxRef().close();

    fixture.detectChanges();

    assertThat(`${classSelectorPrefix}-container.is-leaving`).exists();
  });

  it('Can set default theme', async () => {
    AnchoredFloatingBox.setDefaultTheme('dark');

    @Component({
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [TriggerFloatingBoxForDirective, AnchoredFloatingBox],
      selector: 'lc-test',
      template: `
        <button
          id="click-me"
          [lcTriggerFloatingBoxFor]="floatingBox"
          type="button">
          Click me
        </button>

        <lc-anchored-floating-box #floatingBox>
          <span>Hello World</span>
        </lc-anchored-floating-box>
      `
    })
    class TestBedComponent {}
    const fixture = await render(TestBedComponent);

    fireEvent('#click-me', 'click');

    fixture.detectChanges();

    assertThat(`${classSelectorPrefix}.dark-theme`).exists();
    assertThat(`${classSelectorPrefix}.light-theme`).doesNotExist();
  });
});
