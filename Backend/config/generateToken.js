import jwt from 'jsonwebtoken';
import { redisClient } from '../index.js'; 

// generateToken: create a JWT (JSON Web Token) for a given user id.
// Returns the signed token string. This token can be returned to the client
// and used to authenticate future requests.
export const generateToken = async (id, res) => {
    // Create an access token that lasts for 1 minute.
    const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "1m",
    });

    // Create a refresh token that lasts for 7 days.
    const refreshToken = jwt.sign({ id }, process.env.REFRESH_SECRET, {
        expiresIn: "7d",
    });

    const refreshTokenKey = `refresh_token:${id}`;
    
    // Store the refresh token in Redis with a 7-day expiration.
    await redisClient.setEx(refreshTokenKey, 7 * 24 * 60 * 60, refreshToken);

    // Set the access token and refresh token as HTTP-only cookies in the response.
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 1*60*1000,
    });

    // Set the refresh token as an HTTP-only cookie in the response.
    res.cookie("refreshToken", refreshToken, {
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
        sameSite: "none",
        secure: true, 
    })
    // Return both tokens for further use if needed.
    return {accessToken, refreshToken};
};

// verifyRefreshToken: checks if a given refresh token is valid and matches the one stored in Redis for the user.
export const verifyRefreshToken = async(refreshToken) =>{
    try {
        const decode = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
        const storedToken = await redisClient.get(`refresh_token:${decode.id}`);

        // If the stored token matches the provided refresh token, return the decoded data.
        if(storedToken === refreshToken){
            return decode;
        }
        return null;
    } catch (error) {
        return null;
    }
}


// generateAccessToken: creates a new access token for a given user id and sets it as a cookie in the response.
export const generateAccessToken = (id, res) => {
    const accessToken = jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: "1m",
    })
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 1*60*1000,
    });
}


// revokeRefreshToken: removes the refresh token for a given user id from Redis, effectively logging the user out.
export const revokeRefreshToken = async(userId)=>{
    await redisClient.del(`refresh_token:${userId}`);
};