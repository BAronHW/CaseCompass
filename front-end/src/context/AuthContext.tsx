interface authContextProps {
    userId : string,
    uuid : string,
    loggedIn : boolean,
}

export default function AuthContext(props : authContextProps) {
    const { userId, uuid, loggedIn } = props; //deconstruct the props object
  return (
    <>
        <div>AuthContext</div>
        <div>{userId}</div>
        <div>{uuid}</div>
        <div>{loggedIn}</div>
    </>
  )
}
