import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UserInfo, ApiError } from './UserInfo';
import { UserCredentials } from './Credentials';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => UserInfo)
  async signUp(@Args('credentials') credentials: UserCredentials) {
    return this.authService.signUp(credentials);
  }
}