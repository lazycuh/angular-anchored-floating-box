import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { delayBy, renderComponent } from '../../test/helpers';

import { AnchoredFloatingBox } from './anchored-floating-box.component';
import { TriggerFloatingBoxForDirective } from './trigger-floating-box-for.directive';

describe('AnchoredFloatingBox', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('Should not render the floating box without clicking the trigger first', async () => {
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
          <span>Hello World 1</span>
        </lc-anchored-floating-box>
      `
    })
    class TestBedComponent {}

    await renderComponent(TestBedComponent);

    expect(screen.getByText('Click me')).toBeInTheDocument();
    expect(screen.queryByText('Hello World 1')).not.toBeInTheDocument();
  });

  it('Should render the floating box when the trigger is clicked', async () => {
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
          <span>Hello World 2</span>
        </lc-anchored-floating-box>
      `
    })
    class TestBedComponent {}

    await renderComponent(TestBedComponent);

    expect(screen.queryByText('Hello World 2')).not.toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByText('Click me'));

    expect(screen.getByText('Hello World 2')).toBeInTheDocument();
  });

  it('Can set theme', async () => {
    @Component({
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [TriggerFloatingBoxForDirective, AnchoredFloatingBox],
      selector: 'lc-test-3',
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
          <span>Hello World 3</span>
        </lc-anchored-floating-box>
      `
    })
    class TestBedComponent {}

    const renderResult = await renderComponent(TestBedComponent);

    const user = userEvent.setup();
    await user.click(screen.getByText('Click me'));

    expect(renderResult.container.parentElement!.querySelectorAll('.dark-theme')).toHaveLength(1);
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
          <span>Hello World 4</span>
        </lc-anchored-floating-box>
      `
    })
    class TestBedComponent {}

    const renderResult = await renderComponent(TestBedComponent);

    const user = userEvent.setup();
    await user.click(screen.getByText('Click me'));

    // Length 2 because the class name provided to <lc-anchored-floating-box />
    // is also passed to the renderer
    expect(renderResult.container.parentElement!.querySelectorAll('.custom-class')).toHaveLength(2);
  });

  it('Can export directive under "floatingBoxRef" name', async () => {
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

    const renderResult = await renderComponent(TestBedComponent);

    const user = userEvent.setup();
    await user.click(screen.getByText('Click me'));

    expect(screen.getByText('Hi there!')).toBeInTheDocument();

    renderResult.fixture.componentInstance.floatingBoxRef().close();

    await delayBy(16);

    expect(renderResult.container.parentElement!.querySelectorAll('.is-leaving')).toHaveLength(1);
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
          <span>Hello World 5</span>
        </lc-anchored-floating-box>
      `
    })
    class TestBedComponent {}

    const renderResult = await renderComponent(TestBedComponent);

    const user = userEvent.setup();
    await user.click(screen.getByText('Click me'));

    expect(screen.getByText('Hello World 5')).toBeInTheDocument();

    expect(renderResult.container.parentElement!.querySelectorAll('.dark-theme')).toHaveLength(1);
    expect(renderResult.container.parentElement!.querySelectorAll('.light-theme')).toHaveLength(0);
  });
});
