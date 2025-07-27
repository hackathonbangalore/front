import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GuardListPage } from './guard-list.page';

describe('GuardListPage', () => {
  let component: GuardListPage;
  let fixture: ComponentFixture<GuardListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GuardListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
