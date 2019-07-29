import React from 'react';
import { View, Button, Text, ScrollView } from 'react-native';
import {
	Menu,
	MenuOptions,
	MenuOption,
	MenuTrigger,
	MenuProvider,
} from 'react-native-popup-menu';
import AppStyle from './App.style';
import Dialog from "react-native-dialog";
import AsyncStorage from '@react-native-community/async-storage';


interface AppState {
	recognizedText: string
	isRecording: boolean,
	isEmailDialogVisible: boolean,
	currentEmail: string | null,
	/**
	 * Whether the recorded text should be emailed after the email address has been updated
	 */
	emailAfterSave: boolean
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
	private email = () => {
		if (!this.state.currentEmail)
			this.showChangeEmailDialog();
	}
	/**
	 * Change the destination email adress
	 */
	private changeEmail = async () => {
		await this.updateEmail(this.state.currentEmail);
		this.setState({
			isEmailDialogVisible: false
		}, () => {
			//Check if the currently recorded text should be emailed after this update, and if yes, email it
			if (this.state.emailAfterSave) {
				this.email();
				this.setState({
					emailAfterSave: false
				})
			}
		})
	}

	/**
	 * Show the dialog to change the email address saved
	 */
	private showChangeEmailDialog = (emailAfter: boolean = false) => {
		this.setState({
			isEmailDialogVisible: true,
			emailAfterSave: emailAfter
		})
	}

	private closeChangeEmailDialog = async () => this.setState({
		isEmailDialogVisible: false,
		emailAfterSave: false,
		currentEmail: await this.getEmail()
	})

	private async getEmail(): Promise<string | null> {
		return AsyncStorage.getItem('email').then((value) => value);
	}

	private async updateEmail(email: any): Promise<void> {
		console.log(email);
		return AsyncStorage.setItem('email', email).catch((e) => console.log(e))
	}

	constructor(props: Readonly<{}>) {
		super(props);
		this.state = {
			isRecording: false,
			recognizedText: "",
			isEmailDialogVisible: false,
			currentEmail: "",
			emailAfterSave: false
		}
	}

	async componentDidMount() {
		//Get the saved email address
		const currentEmail = await this.getEmail();
		this.setState({
			currentEmail: currentEmail
		})
	}

	private updateLocalEmail = (text: string) => this.setState({
		currentEmail: text
	})


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
								<MenuOption text="Seteaza adresa de email" onSelect={this.showChangeEmailDialog}></MenuOption>
							</MenuOptions>
						</Menu>
					</View>
					<Dialog.Container onBackdropPress={this.closeChangeEmailDialog} visible={this.state.isEmailDialogVisible}>
						<Dialog.Title>Introdu o adresa de email</Dialog.Title>
						<Dialog.Input autoCapitalize={"none"} autoCompleteType={"email"} style={AppStyle.emailInput} label="Email" value={this.state.currentEmail !== null ? this.state.currentEmail : "example@gmail.com"} onChangeText={this.updateLocalEmail}></Dialog.Input>
						<Dialog.Button color='#5081eb' label="Salvează" onPress={this.changeEmail} />
						<Dialog.Button onPress={this.closeChangeEmailDialog} color='#5081eb' label="Anulează" />
					</Dialog.Container>
					<View style={AppStyle.recorderTextContainer}>
						<ScrollView >
							<Text style={this.state.recognizedText === "" ? AppStyle.recorderTextPlaceholder : AppStyle.recorderText}>
								{this.state.recognizedText === "" ? RecordingViewPlacehodler : this.state.recognizedText}</Text>
						</ScrollView>
					</View>
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