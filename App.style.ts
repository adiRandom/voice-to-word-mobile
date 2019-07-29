import { StyleSheet } from "react-native";

const AppStyle = StyleSheet.create({
    topAppBar: {
        backgroundColor: '#5081eb',
        height: 48,
        flexDirection: 'row-reverse'
    },
    container: {
        flex: 1
    },
    button: {
        flex: 5,
        width: 200,
        alignSelf: 'center',
        marginBottom: 32
    },
    recorderTextPlaceholder: {
        color: '#888d99',
        fontFamily: 'Roboto',
        fontSize: 14,
    },
    recorderText: {
        color: '#000000',
        fontFamily: 'Roboto',
        fontSize: 14
    },
    menuItem: {
        height: 42,
        textAlignVertical: 'center',
        fontSize: 16,
        fontFamily: "Roboto"
    },
    menuItems: {
        marginTop: 48
    },
    recorderTextContainer:{
        marginTop: 16,
        marginLeft: 8,
        flex: 80,
        height:100
    },
    emailInput:{
        borderBottomColor:"#5081eb",
        borderBottomWidth:1,
    },
    menuTrigger:{
        marginTop:6,
        marginRight:6
    }
});

export default AppStyle;