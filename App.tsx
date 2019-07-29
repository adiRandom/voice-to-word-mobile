import React from 'react';
import { View, Button, Text, ScrollView, Image } from 'react-native';
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
import Voice from 'react-native-voice';
import { PermissionsAndroid } from 'react-native';
import email from 'react-native-email'



interface AppState {
	recognizedText: string | null
	isRecording: boolean,
	isEmailDialogVisible: boolean,
	currentEmail: string | null,
	/**
	 * Whether the recorded text should be emailed after the email address has been updated
	 */
	emailAfterSave: boolean,
	/**
	 * Represents the user permissions
	 */
	canRecord: boolean,
	isClearDialogVisible: boolean,
	isSaveDialogVisible: boolean
}

const RecordingViewPlacehodler = "Începe inregistrarea pentru a vedea aici varianta text";

type ConfirmDialogs = "SAVE" | "CLEAR";

export default class App extends React.Component<{}, AppState>{

	/**
	 * Toggle the recording and speech recognition service
	 */
	private toggleRecording = async () => {
		//check whether the recording should stop or start

		if (this.state.isRecording) {
			await this.stopRecording();
		}
		else {
			await this.startRecording();
		}
	}
	/**
	 * Email the recognized text to a specified email adress
	 */
	private email = () => {
		if (!this.state.currentEmail)
			this.showChangeEmailDialog();
		email(this.state.currentEmail, {
			subject: 'Voice to word',
			body: this.state.recognizedText
		})
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

	private closeConfirmDialog = (type: ConfirmDialogs) => {
		switch (type) {
			case "CLEAR": this.setState({
				isClearDialogVisible: false
			}); break;
			case "SAVE": this.setState({
				isSaveDialogVisible: false
			}); break;
		}
	}

	private showConfirmDialog = (type: ConfirmDialogs) => {
		switch (type) {
			case "CLEAR": this.setState({
				isClearDialogVisible: true
			}); break;
			case "SAVE": this.setState({
				isSaveDialogVisible: true
			}); break;
		}
	}

	private async getEmail(): Promise<string | null> {
		return AsyncStorage.getItem('email').then((value) => value);
	}

	private async updateEmail(email: any): Promise<void> {
		return AsyncStorage.setItem('email', email).catch((e) => console.log(e))
	}

	constructor(props: Readonly<{}>) {
		super(props);
		this.state = {
			isRecording: false,
			recognizedText: null,
			isEmailDialogVisible: false,
			currentEmail: "",
			emailAfterSave: false,
			canRecord: true,
			isClearDialogVisible: false,
			isSaveDialogVisible: false
		}

		//Bind Voice events
		Voice.onSpeechResults = this.textRecived;
		Voice.onSpeechEnd = this.onEnded;
	}

	async componentDidMount() {
		//Get the saved email address and last saved text
		const currentEmail = await this.getEmail();
		const text = await this.getText();
		this.setState({
			currentEmail: currentEmail,
			recognizedText: text
		})

		//Ask for user permission

		const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO)
		if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
			//Permissions not granted. Disable the recording button
			this.setState({ canRecord: false });
		} else {
			this.setState({ canRecord: true });
		}

	}

	private updateLocalEmail = (text: string) => this.setState({
		currentEmail: text
	})

	private textRecived = (e) => {
		const current = this.state.recognizedText ? this.state.recognizedText : "";
		this.setState({
			recognizedText: current + " " + e.value[0]
		}, this.restartListening)
	}


	private onEnded = () => {
		this.stopRecording();
	}

	private restartListening = async () => {
		if (this.state.isRecording) {
			await this.stopRecording(this.startRecording)
		}
		else
			await this.startRecording();
	}

	private stopRecording = async (callback?: () => void) => {
		await Voice.stop();
		this.setState({
			isRecording: false
		}, callback)
	}

	private startRecording = async () => {
		if (await Voice.isAvailable()) {
			try {
				await Voice.start("ro-RO");
			}
			catch (e) {
				console.log(e);
			}
			this.setState({
				isRecording: true
			})
		}
	}

	private saveText = async () => {
		await AsyncStorage.setItem("recognizedText", this.state.recognizedText);
		this.setState({
			isSaveDialogVisible: false
		})
	}
	private getText = async () => await AsyncStorage.getItem("recognizedText");
	private clearText = () => this.setState({
		recognizedText: null,
		isClearDialogVisible: false
	})


	render() {
		return (
			<MenuProvider>
				<View style={AppStyle.container}>
					{/* Top app bar */}
					<View style={AppStyle.topAppBar}>
						<Menu>
							<MenuTrigger>
								<Image style={AppStyle.menuTrigger} source={require("./assets/icons/more-36.png")}></Image>
							</MenuTrigger>
							<MenuOptions customStyles={{
								optionsContainer: AppStyle.menuItems,
								optionText: AppStyle.menuItem
							}}>
								<MenuOption text="Seteaza adresa de email" onSelect={this.showChangeEmailDialog}></MenuOption>
								<MenuOption text="Curață" onSelect={() => this.showConfirmDialog("CLEAR")}></MenuOption>
								<MenuOption text="Salvează" onSelect={() => this.showConfirmDialog("SAVE")}></MenuOption>
							</MenuOptions>
						</Menu>
					</View>
					<Dialog.Container onBackdropPress={this.closeChangeEmailDialog} visible={this.state.isEmailDialogVisible}>
						<Dialog.Title>Introdu o adresa de email</Dialog.Title>
						<Dialog.Input autoCapitalize={"none"} autoCompleteType={"email"} style={AppStyle.emailInput} label="Email" value={this.state.currentEmail !== null ? this.state.currentEmail : "example@gmail.com"} onChangeText={this.updateLocalEmail}></Dialog.Input>
						<Dialog.Button color='#5081eb' label="Salvează" onPress={this.changeEmail} />
						<Dialog.Button onPress={this.closeChangeEmailDialog} color='#5081eb' label="Anulează" />
					</Dialog.Container>
					<Dialog.Container onBackdropPress={() => this.closeConfirmDialog("SAVE")} visible={this.state.isSaveDialogVisible}>
						<Dialog.Title>Salvarea înregistrării curente va duce la pierderea celei precedente.Continuați?</Dialog.Title>
						<Dialog.Button color='#5081eb' label="Da" onPress={this.saveText} />
						<Dialog.Button onPress={this.closeConfirmDialog} color='#5081eb' label="Nu" />
					</Dialog.Container>
					<Dialog.Container onBackdropPress={() => this.closeConfirmDialog("CLEAR")} visible={this.state.isClearDialogVisible}>
						<Dialog.Title>Sigur dorești să ștergi înregistrarea curentă?</Dialog.Title>
						<Dialog.Button color='#5081eb' label="Da" onPress={this.clearText} />
						<Dialog.Button onPress={this.closeConfirmDialog} color='#5081eb' label="Nu" />
					</Dialog.Container>
					<View style={AppStyle.recorderTextContainer}>
						<ScrollView >
							<Text style={this.state.recognizedText === null ? AppStyle.recorderTextPlaceholder : AppStyle.recorderText}>
								{this.state.recognizedText === null ? RecordingViewPlacehodler : this.state.recognizedText}</Text>
						</ScrollView>
					</View>
					<View style={AppStyle.button}>
						<Button disabled={!this.state.canRecord} color='#5081eb' title={this.state.isRecording ? "Stop" : "Start"} onPress={this.toggleRecording}></Button>
					</View>
					<View style={AppStyle.button}>
						<Button color='#5081eb' title="Trimite" onPress={this.email}></Button>
					</View>
				</View >
			</MenuProvider>
		)
	}
}