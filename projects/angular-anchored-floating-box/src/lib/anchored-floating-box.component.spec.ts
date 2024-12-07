import { DebugElement, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { assertThat, delayBy } from '@lazycuh/angular-testing-kit';

import { AnchoredFloatingBoxComponent } from './anchored-floating-box.component';

describe('AnchoredFloatingBoxComponent', () => {
  const classPrefix = '.lc-anchored-floating-box';
  let component: AnchoredFloatingBoxComponent;
  let fixture: ComponentFixture<AnchoredFloatingBoxComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnchoredFloatingBoxComponent],
      providers: [provideExperimentalZonelessChangeDetection()]
    }).compileComponents();

    fixture = TestBed.createComponent(AnchoredFloatingBoxComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('Should have "<span>Hello World</span>" as the body', async () => {
    const content = document.createElement('span');

    content.innerText = 'Hello World';
    component.open(document.createElement('button'), content);

    await delayBy(32);

    assertThat(`${classPrefix}__content`).hasInnerHtml('<span>Hello World</span>');
  });

  it('Should be placed at the bottom of anchor element', async () => {
    component.open(document.createElement('button'), document.createElement('div'));

    await delayBy(32);

    assertThat(debugElement.query(By.css('.top'))).doesNotExist();
    assertThat(debugElement.query(By.css('.bottom'))).exists();
  });

  it('Should be placed at the top of the anchor if it overflows the bottom edge of the viewport', async () => {
    const anchor = document.createElement('button');

    anchor.setAttribute('style', 'position:fixed; bottom:0');
    document.body.appendChild(anchor);

    component.open(anchor, document.createElement('span'));

    await delayBy(32);

    assertThat(debugElement.query(By.css('.bottom'))).doesNotExist();
    assertThat(debugElement.query(By.css('.top'))).exists();
  });

  it('Should close floating box when its backdrop is clicked', async () => {
    component.open(document.createElement('button'), document.createElement('span'));

    await delayBy(32);

    expect(debugElement.classes['enter']).toBeTrue();

    debugElement
      .query(By.css(`${classPrefix}__backdrop`))
      .triggerEventHandler('click', { stopPropagation: jasmine.createSpy() });

    expect(debugElement.classes['leave']).toBeTrue();
  });

  it('Should use light theme by default', async () => {
    component.open(document.createElement('button'), document.createElement('span'));

    await delayBy(32);

    assertThat(debugElement.query(By.css('.light'))).exists();
  });

  it('Should stop click events from bubbling to window', async () => {
    const clickHandlerSpy = jasmine.createSpy();

    window.addEventListener('click', clickHandlerSpy, false);

    component.open(document.createElement('button'), document.createElement('span'));

    await delayBy(32);

    expect(debugElement.classes['enter']).toBeTrue();

    debugElement.query(By.css(`${classPrefix}__backdrop`)).triggerEventHandler('click');

    await delayBy(32);

    expect(debugElement.classes['leave']).toBeTrue();
    expect(clickHandlerSpy).not.toHaveBeenCalled();

    window.removeEventListener('click', clickHandlerSpy, false);
  });
});
