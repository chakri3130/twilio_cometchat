import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatUiPage } from './chat-ui.page';

describe('ChatUiPage', () => {
  let component: ChatUiPage;
  let fixture: ComponentFixture<ChatUiPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ChatUiPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
