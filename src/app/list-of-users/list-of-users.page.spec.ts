import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListOfUsersPage } from './list-of-users.page';

describe('ListOfUsersPage', () => {
  let component: ListOfUsersPage;
  let fixture: ComponentFixture<ListOfUsersPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ListOfUsersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
