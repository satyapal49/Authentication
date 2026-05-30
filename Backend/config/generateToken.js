import jwt from 'jsonwebtoken';

// generateToken: create a JWT (JSON Web Token) for a given user id.
// Returns the signed token string. This token can be returned to the client
// and used to authenticate future requests.
export const generateToken = async (id) => {
    const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "1m",
    });
    return accessToken;

    const refreshToken = jwt.sign({ id }, process.env.REFRESH_SECRET, {
        expiresIn: "7d",
    });

    const refreshTokenKey = `refresh-token:${id}`;
    await redisClient.setEx(refreshTokenKey, 7 * 24 * 60 * 60, refreshToken);

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        // secure: true,
        sameSite: "strict",
        maxAge: 1*60*1000,
    })

    res.cookie("refreshToken", refreshToken, {
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
        sameSite: "none",
        // secure: true, 
    })

    return {accessToken, refreshToken};
}