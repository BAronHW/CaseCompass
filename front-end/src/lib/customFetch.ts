import { requestTypeEnum } from "../interfacesEnumsAndTypes/enums";
/**
 * 
 * TODO:
 * Need to implement refetch logic where if there is an error you try to refetch 3 times.
 */

export const customFetch = async (url: string, requestType: requestTypeEnum, accessToken?: string, body?: Record<string, unknown>) => {

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

        const method = serializedRequestType().toString()

        const headerWithToken = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        }

        const headerNoToken = {
            "Content-Type": "application/json",
        }

        const options : RequestInit = {
            method: method,
            headers: accessToken !== undefined ? headerWithToken : headerNoToken,
            credentials: 'include'
        }

        if(method !== 'GET' && body){
            options.body = JSON.stringify(body);
        };

        const response = await fetch(url, options);
        const respJson = await response.json();

        if(response.status > 400 && respJson.message === 'Token has expired'){

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
                // TODO need to test this refresh logic
              }catch(error){
                
                const retryCount = 3;
                let currentCount = 0;

                while(currentCount < retryCount){
                    const response = await fetch('http://localhost:3000/api/auth/refresh', {
                        method: 'POST',
                        credentials: 'include'
                    })

                    if(response.ok){
                        const serializedResponse = await response.json();
                        sessionStorage.setItem('Authorization', serializedResponse.newAccessToken);
                        currentCount = 3;
                        return serializedResponse;
                    }
                    
                    currentCount++;
                }
                console.log(error)
              }
        }

        if(!response.ok){
            throw new Error(`Response status: ${response.status}`);
        }

        return respJson;

    }catch(error){
        throw new Error(`Error message ${error}`);
    }

}

export { requestTypeEnum };
