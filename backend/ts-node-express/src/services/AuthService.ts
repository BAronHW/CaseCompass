export class AuthService {
    public async registerUser(name: string, email: string, password: string) {
        const {name, email, password} = req.body;
        
                const userHasExists = await db.user.findFirst({
                    where:{
                        email: email
                    }
                })
        
                if(userHasExists){
                    res.status(400).send('This user already exists!');
                    return
                }
        
                const hashedPassword = await bcrypt.hash(password, 10);
                const uuid = crypt.randomUUID()
        
                const newUser = await db.user.create({
                    data:{
                        name: name,
                        email: email,
                        password: hashedPassword,
                        uid: uuid,
                        refreshToken:''
        
                    }
                })
        
                if (!newUser) {
                    res.status(400).json({
                        error: 'Unable to make new user'
                    })
                }
        
                await db.chat.create({
                    data: {
                        userId: newUser.id,
        
                    }
                })
        
                await db.accountTemplate.create({
                    data:{
                        ownerId: newUser.id
                    }
                })
        
                const returnNewUser = {
                    name: name,
                    email: email,
                    uuid: uuid
                }
        
                res.status(201).json({
                    message:'User registered',
                    newUser: returnNewUser
                });
                return
    }
}