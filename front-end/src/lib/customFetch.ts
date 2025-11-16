import { requestTypeEnum } from "../interfacesEnumsAndTypes/enums";
/**
 * Maybe break down this function into smaller parts
 */

export const customFetch = async (url: string, requestType: requestTypeEnum, body?: Record<string, unknown>) => {

    try{

        const serializedRequestType = () : string | Error => {

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

        const options : RequestInit = {
            method: method,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        }

        if(method !== 'GET' && body){
            options.body = JSON.stringify(body);
        };

        const response = await fetch(url, options);
        const respJson = await response.json();

        if(response.status >= 400 && respJson.message === 'Token has expired'){

            try{
                const response = await fetch('http://localhost:3000/api/auth/refresh', {
                  method: "POST",
                  credentials: "include",
                })
                
                const respJson = await response.json();

                const retryCount = 3;
                let currentCount = 0;

                while(currentCount < retryCount){

                    const authToken = {
                        accessToken: respJson.newAccessToken
                    }
                    const response = await fetch(url, {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(authToken)
                    })


                    if(response.ok){
                        const serializedResponse = await response.json();
                        sessionStorage.setItem('Authorization', serializedResponse.newAccessToken);
                        currentCount = 3;
                        return serializedResponse;
                    }
                    
                    currentCount++;

                }

              }catch(error){
                // throw new Error('unable to refresh')
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

export { requestTypeEnum }