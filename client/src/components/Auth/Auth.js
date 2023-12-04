import React, { useState } from "react";
import { Avatar, Button, Paper, Grid, Typography, Container, Snackbar } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import useStyles from "./styles";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import { useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Input from "./Input";
import SelectInput from "./SelectInput";
import { login, register, guestLogin } from "../../actions/auth";

const initialState = {
  userType: "",
  firstName: "",
  lastName: "",
  userName: "",
  mail: "",
  password: "",
  confirmPassword: "",
};

function Auth() {
  const classes = useStyles();
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState(initialState);
  const [errorMessage, setErrorMessage] = useState("");
  const history = useHistory();
  const dispatch = useDispatch();

  const isLanguageEnglish = useSelector((state) => state.language.isEnglish);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isSignup) {
        const response = await dispatch(register(formData, history));
        console.log("response:", response);
        if (response.status === 200) {
          console.log("Register OK!");
        } else if (response.status === 400) {
          const errorMessage = response.error.response.data.message;
          if (errorMessage.includes("shorter than the minimum allowed length")) {
            setErrorMessage(`Username must be at least five characters.`);
          } else {
            setErrorMessage(`Registration failed: ${errorMessage}`);
          }
        } else {
          setErrorMessage(`Registration failed`);
        }
      } else {
        await dispatch(login(formData, history));
      }
    } catch (error) {
      console.log("error:", error);
      setErrorMessage("An error occurred. Please try again.");
    }
  };
  const handleGuestLogin = async () => {
    try {
      await dispatch(guestLogin(formData, history));
    } catch (error) {
      console.log("Guest login error:", error);
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleShowPassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };
  const switchMode = () => {
    setIsSignup((prevIsSignup) => !prevIsSignup);
    setShowPassword(false);
  };
  return (
    <Container component="main" maxWidth="xs">
      <Paper className={classes.paper} elevation={3}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        {errorMessage && (
          <Snackbar
            open={!!errorMessage}
            autoHideDuration={6000}
            onClose={() => setErrorMessage("")}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert severity="error">{errorMessage}</Alert>
          </Snackbar>
        )}
        <Typography component="h1" variant="h5">
          {isSignup ? (isLanguageEnglish ? "Sign up" : "註冊") : isLanguageEnglish ? "Sign in" : "登入"}
        </Typography>
        <form className={classes.form} onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {isSignup && (
              <>
                <Input name="firstName" label={isLanguageEnglish ? "First Name" : "名字"} handleChange={handleChange} autoFocus half />
                <Input name="lastName" label={isLanguageEnglish ? "Last Name" : "姓氏"} handleChange={handleChange} half />
                <SelectInput
                  name="userType"
                  value={formData.userType}
                  handleChange={handleChange}
                  label={isLanguageEnglish ? "User type" : "使用者類別"}
                  options={[
                    { value: "Teacher", label: "Teacher" },
                    { value: "Student", label: "Student" },
                  ]}
                />
                <Input name="mail" label={isLanguageEnglish ? "Email address" : "電子郵件"} handleChange={handleChange} type="email" />
              </>
            )}

            <Input name="userName" label={isLanguageEnglish ? "User Name" : "帳號名稱"} handleChange={handleChange} />
            <Input
              name="password"
              label={isLanguageEnglish ? "Password" : "密碼"}
              handleChange={handleChange}
              type={showPassword ? "text" : "password"}
              handleShowPassword={handleShowPassword}
            />
            {isSignup && (
              <Input
                name="confirmPassword"
                label={isLanguageEnglish ? "Repeat password" : "確認密碼"}
                handleChange={handleChange}
                type="password"
              />
            )}
          </Grid>
          <Button type="submit" fullWidth variant="contained" color="primary" className={classes.submit}>
            {isSignup ? (isLanguageEnglish ? "Sign up" : "註冊") : isLanguageEnglish ? "Sign in" : "登入"}
          </Button>
          {!isSignup && (
            <Button fullWidth variant="contained" className={classes.submit} onClick={handleGuestLogin}>
              {isLanguageEnglish ? "Guest Login" : "訪客登入"}
            </Button>
          )}
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Button onClick={switchMode}>
                {isSignup
                  ? isLanguageEnglish
                    ? "Already have an account? Sign in"
                    : "你已經有了帳號嗎？登入"
                  : isLanguageEnglish
                  ? "Don't have an account? Sign Up"
                  : "你還沒有這個玩過嗎？請務必試試看"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}

export default Auth;
