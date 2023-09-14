import { createContext, useContext, useEffect, useState } from 'react';
import {
    useAddress,
    useContract,
    useMetamask,
    useDisconnect,
    useSigner,
} from "@thirdweb-dev/react";
import { ethers } from 'ethers';


const StateContext = createContext();


export const StateContextProvider = ({children}) => {
 const {contract} = useContract("0x1A698f11Db83CBe121eF059A5897Dd63A98a8eB0");

 const address = useAddress();
 const connect = useMetamask();
 const disconnect = useDisconnect();
 const Signer = useSigner();

 const [userBlance ,setUserBlance ] = useState();
 const [loading , setLoading] = useState(false);

    const fetchData = async () => {
        try {
                const balance = await Signer?.getBalance();
                const userBalance = address ? ethers.utils.formatEther(balance?.toString()) : "";
                setUserBlance(userBalance);
            } catch (error) {
                console.log(error);      
            }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const UploadImage = async(imageInfo) => {
        const {title , description , email , category , image} = imageInfo;
        try {
            const listingPrice = await contract.call("listingPrice");
            const createNFTS = await contract.call(
                "uploadIPFS",
                [address , image ,title ,description , email , category ],
                {
                    value:listingPrice.toString(),
                }
            );
            //Api call
            const response = await axios({
                method:"POST",
                url:`/api/v1/NFTS`,
                data:{
                    title:title,
                    description:description,
                    category:category,
                    image:image,
                    address:address,
                    email:email,
                },
                
            });

            console.log(response);
            console.log("contract call success" , createNFTS);

            setLoading(false);
            window.location.reload();
        } catch (err) {
            console.error("Contract call failure " , err)
        }
    }
        // get contract data

        const getUploadImages = async() => {
        const images = await contract.call("getAllNFTs");

        //total Upload
        const totalUpload = await contract.call("imagesCount");
        const listingPrice = await contract.call("listingPrice");
        const allImages = images.map((images , i)=>({
            owner: images.creator,
            title:images.title,
            description:images.description,
            email:images.email,
            category:images.category,
            fundraised:images.fundraised,
            images:images.image,
            imageID:images.id.toNumber(),
            createdAt:images.timestamp.toNumber(),
            listedAmount:ethers.utils.formatEther(listingPrice.toString()),
            totalUpload:totalUpload.toNumber(),
        }));
        return allImages;
}

    //Get single nft
    const singleImage = async (id) => {
        try {
            const data =await contract.call("getNFT" , [id]);
            const image={
                title:data[0],
                description:data[1],
                email:data[2],
                category:data[1],
                fundRaised:ethers.utils.formatEther(data[4].toString()),
                creator:data[5],
                imageURL:data[6],
                createdAt:data[7].toNumber(),
                imageId:data[8].toNumber(),
            }
            return image;
            
        } catch (error) {
            console.log("Contract call failure " , error)
        }
    }

    const donateFund = async({amount , Id}) => {
    try {
        console.log(amount ,Id);
        const transaction =await contract.call("donateToNFT", [Id],{
            value:amount.toString(),

        })
        console.log(transaction);
        window.location.reload();

    } catch (error) {
        console.log(error);
    }   
    }

    //get api data
    const getAllNFTsAPI = async() => {
        const response=await axios({
            method:"GET",
            url:"/api/v1/NFTs",
        });
        console.log(response);
    }


    const getSingleNftsAPI = async (id) => {
        const response=await axios({
            method:"GET",
            url:`/api/v1/NFTs${id}`,
        });
        console.log(response);
    }

    return(
        <StateContext.Provider value={{
            address,
            contract,
            connect,
            disconnect,
            userBlance,
            setLoading,
            loading,
            UploadImage,
            getUploadImages,
            donateFund,
            singleImage,
            getAllNFTsAPI,
            getSingleNftsAPI
        }}
        >
        {children}
        </StateContext.Provider>
    )
}

export const useStateContext = () => useContext(StateContext)

