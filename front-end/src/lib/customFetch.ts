import { requestTypeEnum } from "../interfacesEnumsAndTypes/enums";

/**
 * 
 * 1. depending on what kind of request string for the fetch api
 * 2. create 
 * 
 */

export const customFetch = async (url: string, requestType: requestTypeEnum, accessToken?: string, body?: JSON) => {

    try{

        const serializedRequestType = () : string | Error=> {

            switch(requestType){
                case requestTypeEnum.GET:
                    return 'GET';
    
                case requestTypeEnum.POST:
                    return 'POST';
    
                case requestTypeEnum.DELETE:
                    return 'DELETE';
    
                case requestTypeEnum.PUT:
                    return 'PUT';
    
                default:
                    return new Error('unable to serialize the request type');
            }

        }

        const method = serializedRequestType().toString();

        const headerWithToken = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        }

        const headerNoToken = {
            "Content-Type": "application/json",
        }

        const options : RequestInit = {
            method: method,
            headers: accessToken !== null ? headerWithToken : headerNoToken,
            credentials: 'include'
        }

        // GET requests cannot have bodies
        if(method !== 'GET' && body){
            options.body = JSON.stringify(body);
        };

        const response = await fetch(url, options);
        const respJson = await response.json();

        if (method !== 'GET' && body) {
            options.body = JSON.stringify(body);
        }

        if(!response.ok){
            throw new Error(`Response status: ${response.status}`);
        }

        if(response.status > 400 && respJson.message === 'Token has expired'){
            // refetch the accesstoken
            try{
                const response = await fetch('http://localhost:3000/api/auth/refresh', {
                  method: "POST",
                  credentials: "include"
                })
                if(!response.ok){
                return new Error('unable to refresh');
                }
                const respJson = await response.json();
                sessionStorage.setItem("Authorization", respJson.newAccessToken);
              }catch(error){
                console.log(error)
              }
        }

        const returnJson = await response.json();
        return returnJson;

    }catch(error){
        throw new Error(`Error message ${error}`);
    }

}

export { requestTypeEnum };
