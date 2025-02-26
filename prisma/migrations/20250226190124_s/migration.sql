-- DropForeignKey
ALTER TABLE "Application" DROP CONSTRAINT "Application_jobSeekerId_fkey";

-- DropForeignKey
ALTER TABLE "EmployerProfile" DROP CONSTRAINT "EmployerProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "JobSeekerProfile" DROP CONSTRAINT "JobSeekerProfile_userId_fkey";

-- AddForeignKey
ALTER TABLE "EmployerProfile" ADD CONSTRAINT "EmployerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSeekerProfile" ADD CONSTRAINT "JobSeekerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobSeekerId_fkey" FOREIGN KEY ("jobSeekerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
