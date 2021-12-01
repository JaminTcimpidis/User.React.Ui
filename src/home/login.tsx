import React, {useEffect, useState} from "react";
import { Redirect } from "react-router";
import { localStorageAuthRedirectUrl } from "../constants";
import { useAuth } from "../hooks/useAuth";

const Login = ():JSX.Element => {
  const { isAuthed, sendToOktaLogin } = useAuth();
  const [isComplete, setIsComplete] = useState<boolean>(false);

  useEffect(() => {
    const login = async (): Promise<void> => {
      await sendToOktaLogin();
      setIsComplete(true);
    }

    if (!isAuthed()){
      login();
    } else {
      setIsComplete(true);
    }
  },[isAuthed, sendToOktaLogin]);

  if(!isComplete){
    return <span>loading</span>
  }

  let redirectHash = "/"
  const redirectUrl = localStorage.getItem(localStorageAuthRedirectUrl);
  if(redirectUrl) {
    const redirectUrlArray: string[] = redirectUrl.split('#', 2);
    if(redirectUrlArray.length === 2){
      redirectHash = redirectUrlArray[1]
      localStorage.removeItem(localStorageAuthRedirectUrl);
    }
  }

  return <Redirect to={redirectHash} />
}

export default Login;