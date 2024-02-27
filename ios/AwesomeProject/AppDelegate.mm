#import "AppDelegate.h"
#import <Firebase.h>
#import <React/RCTBundleURLProvider.h>
#import <GoogleMaps/GoogleMaps.h>
@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [FIRApp configure];
  [GMSServices provideAPIKey:@"AIzaSyAooYTn6Rsnu5mSV_SY7A11kMM8TWex_2M"];
  GMSCameraPosition *camera = [GMSCameraPosition cameraWithLatitude:47.0169 longitude:-122.336471 zoom:12];
  GMSMapID *mapID = [GMSMapID mapIDWithIdentifier:@"7a28fa6cf1de9a40"];
  GMSMapView *mapView = [GMSMapView mapWithFrame:CGRectZero mapID:mapID camera:camera];
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  self.window.rootViewController = [[UIViewController alloc] init];
  self.window.rootViewController.view = mapView;
  [self.window makeKeyAndVisible];
  self.moduleName = @"AwesomeProject";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}
- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self getBundleURL];
}
- (NSURL *)getBundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
