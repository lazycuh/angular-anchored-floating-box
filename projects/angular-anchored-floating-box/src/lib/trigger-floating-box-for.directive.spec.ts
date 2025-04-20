import { ChangeDetectionStrategy, Component, provideExperimentalZonelessChangeDetection, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { assertThat, delayBy, fireEvent } from '@lazycuh/angular-testing-kit';

import { AnchoredFloatingBoxService } from './anchored-floating-box.service';
import { TriggerFloatingBoxForDirective } from './trigger-floating-box-for.directive';

describe(TriggerFloatingBoxForDirective.name, () => {
  const classSelectorPrefix = '.lc-anchored-floating-box';

  async function render<T>(testBedComponent: Type<T>) {
    await TestBed.configureTestingModule({
      imports: [testBedComponent],
      providers: [AnchoredFloatingBoxService, provideExperimentalZonelessChangeDetection()]
    }).compileComponents();

    const fixture = TestBed.createComponent(testBedComponent);
    fixture.detectChanges();

    await delayBy(250);

    return fixture;
  }

  it('Should not render the template without clicking the trigger first', async () => {
    @Component({
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [TriggerFloatingBoxForDirective],
      selector: 'lc-test',
      template: `
        <button
          id="click-me"
          [lcTriggerFloatingBoxFor]="template"
          type="button">
          Click me
        </button>

        <ng-template
          #template
          let-name>
          <span>Hello World</span>
        </ng-template>
      `
    })
    class TestBedComponent {}
    await render(TestBedComponent);

    assertThat('#click-me').exists();
    assertThat(classSelectorPrefix).doesNotExist();
  });

  it('Should render the template when the trigger is clicked', async () => {
    @Component({
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [TriggerFloatingBoxForDirective],
      selector: 'lc-test',
      template: `
        <button
          id="click-me"
          [lcTriggerFloatingBoxFor]="template"
          type="button">
          Click me
        </button>

        <ng-template #template>
          <span>Hello World</span>
        </ng-template>
      `
    })
    class TestBedComponent {}
    const fixture = await render(TestBedComponent);

    fireEvent('#click-me', 'click');

    fixture.detectChanges();

    assertThat(`${classSelectorPrefix}__content`).hasTextContentMatching(/Hello World/);
  });

  it('Can set theme', async () => {
    @Component({
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [TriggerFloatingBoxForDirective],
      selector: 'lc-test',
      template: `
        <button
          id="click-me"
          [lcTriggerFloatingBoxFor]="template"
          lcFloatingBoxTheme="dark"
          type="button">
          Click me
        </button>

        <ng-template #template>
          <span>Hello World</span>
        </ng-template>
      `
    })
    class TestBedComponent {}
    const fixture = await render(TestBedComponent);

    fireEvent('#click-me', 'click');

    fixture.detectChanges();

    assertThat(`${classSelectorPrefix}.dark`).exists();
    assertThat(`${classSelectorPrefix}.light`).doesNotExist();
  });

  it('Can set context', async () => {
    @Component({
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [TriggerFloatingBoxForDirective],
      selector: 'lc-test',
      template: `
        <button
          id="click-me"
          [lcTriggerFloatingBoxFor]="template"
          [lcFloatingBoxContext]="{ $implicit: 'There!' }"
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
    class TestBedComponent {}
    const fixture = await render(TestBedComponent);

    fireEvent('#click-me', 'click');

    fixture.detectChanges();

    assertThat(`${classSelectorPrefix}__content`).hasTextContentMatching(/Hello There!/);
  });
});
