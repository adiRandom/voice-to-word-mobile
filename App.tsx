import React from 'react';
import { View, Button, Text } from 'react-native';
import {
	Menu,
	MenuOptions,
	MenuOption,
	MenuTrigger,
	MenuProvider,
} from 'react-native-popup-menu';
import AppStyle from './App.style';


interface AppState {
	recognizedText: string
	isRecording: boolean
}

const RecordingViewPlacehodler = "Începe inregistrarea pentrua vedea aici varianta text"

export default class App extends React.Component<{}, AppState>{

	/**
	 * Toggle the recording and speech recognition service
	 */
	private toggleRecroding = () => { }
	/**
	 * Email the recognized text to a specified email adress
	 */
	private email = () => { }
	/**
	 * Change the destination email adress
	 */
	private changeEmail = () => { }

	constructor(props: Readonly<{}>) {
		super(props);
		this.state = {
			isRecording: false,
			recognizedText: ""
		}
	}

	render() {
		return (
			<MenuProvider>
				<View style={AppStyle.container}>
					{/* Top app bar */}
					<View style={AppStyle.topAppBar}>
						<Menu>
							{/* TODO: Add the 3 dot icon */}
							<MenuTrigger text="Placeholder"></MenuTrigger>
							<MenuOptions customStyles={{
								optionsContainer: AppStyle.menuItems,
								optionText: AppStyle.menuItem
							}}>
								<MenuOption text="Seteaza adresa de email" onSelect={this.changeEmail}></MenuOption>
							</MenuOptions>
						</Menu>
					</View>
					<Text style={this.state.recognizedText === "" ? AppStyle.recorderTextPlaceholder : AppStyle.recorderText}>
						{this.state.recognizedText === "" ? RecordingViewPlacehodler : this.state.recognizedText}</Text>
					<View style={AppStyle.button}>
						<Button color='#5081eb' title={this.state.isRecording ? "Stop" : "Start"} onPress={this.toggleRecroding}></Button>
					</View>
					<View style={AppStyle.button}>
						<Button color='#5081eb' title="Trimite" onPress={this.email}></Button>
					</View>
				</View >
			</MenuProvider>
		)
	}
}