import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { assertThat } from '@babybeet/angular-testing-kit';

import { AnchoredFloatingBoxComponent } from './anchored-floating-box.component';

describe('AnchoredFloatingBoxComponent', () => {
  const classPrefix = '.bbb-anchored-floating-box';
  let component: AnchoredFloatingBoxComponent;
  let fixture: ComponentFixture<AnchoredFloatingBoxComponent>;
  let debugElement: DebugElement;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AnchoredFloatingBoxComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnchoredFloatingBoxComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
    fixture.detectChanges();
  });

  it('Should have "<span>Hello World</span>" as the body', () => {
    const content = document.createElement('span');

    content.innerText = 'Hello World';
    component.open(document.createElement('button'), content);
    fixture.detectChanges();

    assertThat(`${classPrefix}__content`).hasInnerHtml('<span>Hello World</span>');
  });

  it('Should be placed at the bottom of anchor element', fakeAsync(() => {
    component.open(document.createElement('button'), document.createElement('div'));
    fixture.detectChanges();
    tick();

    assertThat(debugElement.query(By.css('.top'))).doesNotExist();
    assertThat(debugElement.query(By.css('.bottom'))).exists();
  }));

  it('Should be placed at the top of the anchor if it overflows the bottom edge of the viewport', fakeAsync(() => {
    const anchor = document.createElement('button');

    anchor.setAttribute('style', ['position:fixed', 'bottom:0'].join(';'));
    component.open(anchor, document.createElement('span'));
    fixture.detectChanges();
    document.body.appendChild(anchor);
    tick();

    assertThat(debugElement.query(By.css('.bottom'))).doesNotExist();
    assertThat(debugElement.query(By.css('.top'))).exists();
  }));

  it('Should close floating box when its backdrop triggers pointerup event', () => {
    component.open(document.createElement('button'), document.createElement('span'));
    fixture.detectChanges();
    expect(debugElement.classes['enter']).toBeTrue();
    debugElement
      .query(By.css(`${classPrefix}__backdrop`))
      .triggerEventHandler('pointerup', { stopPropagation: jasmine.createSpy() });
    fixture.detectChanges();
    expect(debugElement.classes['leave']).toBeTrue();
  });

  it('Should use light theme by default', () => {
    component.open(document.createElement('button'), document.createElement('span'));

    fixture.detectChanges();

    assertThat(debugElement.query(By.css('.light'))).exists();
  });
});
