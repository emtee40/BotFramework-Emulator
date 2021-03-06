import * as React from 'react';
import { Provider } from 'react-redux';
import { mount } from 'enzyme';
import { ResourcesSettingsContainer } from './resourcesSettingsContainer';
import { combineReducers, createStore } from 'redux';
import { bot } from '../../../data/reducer/bot';
import { resources } from '../../../data/reducer/resourcesReducer';
import { ResourcesSettings } from './resourcesSettings';
import { load, setActive } from '../../../data/action/botActions';
import { CommandServiceImpl } from '../../../platform/commands/commandServiceImpl';

const mockStore = createStore(combineReducers({ resources, bot }));
jest.mock('./resourcesSettings.scss', () => ({}));
jest.mock('../dialogStyles.scss', () => ({}));

jest.mock('../service', () => ({
  DialogService: {
    showDialog: () => Promise.resolve(true),
    hideDialog: () => Promise.resolve(false),
  }
}));

jest.mock('../../../platform/commands/commandServiceImpl', () => ({
  CommandServiceImpl: {
    remoteCall: async (commandName: string, ...args: any[]) => {
      //
    },
    call: async (commandName: string, ...args: any[]) => {
      //
    }
  }
}));

jest.mock('../../../data/store', () => ({
  RootState: () => ({}),
  get store() {
    return mockStore;
  }
}));

jest.mock('../../../data/botHelpers', () => ({
  getBotInfoByPath: () => ({})
}));

describe('The ResourcesSettings component should', () => {
  let parent;
  let node;
  beforeEach(() => {
    const mockBot = JSON.parse(`{
        "name": "TestBot",
        "description": "",
        "padlock": "",
        "services": [{
            "type": "luis",
            "name": "https://testbot.botframework.com/api/messagesv3",
            "id": "https://testbot.botframework.com/api/messagesv3",
            "appId": "51fc2648-1190-44fa-9559-87b11b1d0014",
            "appPassword": "jxZjGcOpyfM4q75vp2paNQd",
            "endpoint": "https://testbot.botframework.com/api/messagesv3"
        }]
      }`);

    mockStore.dispatch(load([mockBot]));
    mockStore.dispatch(setActive(mockBot));
    parent = mount(<Provider store={ mockStore }>
      <ResourcesSettingsContainer label="test" progress={ 50 }/>
    </Provider>);
    node = parent.find(ResourcesSettings);
  });

  it('should render deeply', () => {
    expect(parent.find(ResourcesSettingsContainer)).not.toBe(null);
    expect(parent.find(ResourcesSettings)).not.toBe(null);
  });

  it('should contain a cancel function in the props', () => {
    expect(typeof (node.props() as any).cancel).toBe('function');
    expect(typeof (node.props() as any).save).toBe('function');
    expect(typeof (node.props() as any).showOpenDialog).toBe('function');
  });

  it('should update the state when the chat input is changed', () => {
    const instance = node.instance();
    expect(instance.state.chatsPath).toBeUndefined();
    instance.onChangeChatInput('hello');
    expect(instance.state.chatsPath).toBe('hello');
  });

  it('should update the state when the transcript input is changed', () => {
    const instance = node.instance();
    expect(instance.state.transcriptsPath).toBeUndefined();
    instance.onChangeTranscriptInput('hello');
    expect(instance.state.transcriptsPath).toBe('hello');
  });

  it('should open the browse dialog when the browse anchor is clicked', async () => {
    const instance = node.instance();
    const spy = jest.spyOn(CommandServiceImpl, 'remoteCall');
    await instance.onBrowseClick({ currentTarget: { getAttribute: () => 'attr' } });
    expect(spy).toHaveBeenCalled();
  });
});
